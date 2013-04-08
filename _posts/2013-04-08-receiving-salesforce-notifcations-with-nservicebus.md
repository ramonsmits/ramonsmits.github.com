---
layout: post
title: "Receiving Salesforce notification with NServiceBus"
tags: [salesforce,nservicebus,sf,nsb,outbound messages,events,notifications]
---

Real-time push based notifications
===
A while ago I worked at a project that synced a set of entities with SalesForce. We wanted to do near real-time updates to/from SalesForce. We were already using NServiceBus and so we tried to design a solution that suited this environment.  Salesforce has the concept of objects but these could at best be seen as a form of active records. A record has an internal identifier and some other defaults like a modification timestamp.

SalesForce API Contracts
===
Lets start with the standard model that salesforce offers. They provide pretty good wsdl's that enable a contract first style of development. To get these wsdl contracts you need to go to

	Setup > App Setup > Develop > Api

![Exporting Enterprise WSDL](/artifacts/wsdl.png)

There you have a couple of contract types available of which only two are relevant:

* Enterprise WSDL
* Partner WSDL

The supplied help is pretty self explanatory but just for reference I mention that the Enterprise schema can contain all custom objects that you design within Salesforce. This is what we use in our environment as it enables type-safe contract first development and that is what I will use in this post.

Generating code
===

Here we get to the first problem as I wanted to generate code based on this wsdl without having to modify it each time it gets updated. This will not work with the 'service reference' style which `svcutil.exe` offers. Not really a problem as we do not really need anything WCF related and makes our life much simpler. The remaining option is the 'web reference' style of communication. This uses the tool `wsdl.exe` to generate code. The reason I mention these tools is that you want to have an easy way to update your contract and to version this in an assembly that you can share in your applications. This makes it possible to create a package build by your buildserver. This contract should not update 'auto-magically' as breaking it could result in either side (salesforce or your application) not being able to process data due to breaking changes. You can just 'add web reference' via the advanced button in the 'add service reference' dialog but let this be a warning!

We generate the code by issuing the following command:

	wsdl.exe exported-enterprise.wsdl /n:SalesForceApi

This generates a c# file `SforceService.cs` containing a client to communicate with SalesForce.

The service client
===

In the supplied code you will find a static class with the name `SalesForceServiceFactory`. This is a factory which creates a `SforceService` instance and is needed as we need to do some handshake magic with SalesForce which basically returns a server that we must use for the current session and authenticate to that server by supplying our authenticated session identifier. It can be configured via a custom configuration section like the following:

 In the supplied code this class resides in the SalesForceApi project and which uses configuration via a custom configuration section:

	<configuration>
		<configSections>
			<section name="SalesForceServiceFactoryConfig" type="SalesForceApi.SalesForceServiceFactory+Config, SalesForceApi" />
		</configSections>
		<SalesForceServiceFactoryConfig
			username="mycoolaccount@superduperdomain.com.test"
			password="passwordissupersafe"
			securityToken="TheSecurityToken" />
	</configuration>


Now we can do a simple test like the following:

	SalesForceApi.SforceService client = SalesForceServiceFactory.Create();
		
	var customer = new SalesForceApi.Account
	{
		AccountNumber = "Smits001",
		Name = "Ramon Smits",
		Website = "http://ramonsmits.com",
	};

	var result = client.create(new SalesForceApi.sObject[] { customer });

	if (!result[0].success) throw new InvalidOperationException("Failed to create account object.");


Updating SalesForce based on NServiceBus events
===

With the code above it now is pretty simple to update or insert a SalesForce object especially when these can be mapped one on one. You could have a message handler that handles both a `CustomerCreatedEvent` and `CustomerUpdatedEvent` or just a more generic `CustomerSavedEvent`. Both work, as SalesForce has an `.create` and `.update` method or you can use the `.upsert` method which combines both.

When you use 'fat events' that contain the complete entity in a CQRS like fashoin then you don't even need to query the database and just map the complete data from the event message to the SalesForce object and then voila you can now use a 'eventual consistent' style updating of SalesForce.

In our solution we can't always map one-on-one and sometimes data is a graph of objects in the form of an aggregate. This gets pretty complex as this requires you to 'upsert' several objects in one call with 'external' defined keys. You do not know the salesforce generated keys upfront as is the same when you do not want to work with identity insert on a sql server database. You generate your own keys known to your system and Salesforce has support for that but that is something for a future post.

Updating our service based on SalesForce notifications
===

The previous was pretty simple but now we are going to see how deep the rabbit hole goes. We want to receive notifications when objects in SalesForce are updated without requiring us to poll the SalesForce service. This needs some attention as you need to configure SalesForce to actually send these notifications. SalesForce really responds very fast with this routine and even faster when the system is 'warm' as in when the whole chain recently was used.

Outbound messages
---
Basically we want to receive a notification when an object is written and the transaction is committed. A notification is an 'outbound message' and this defines the data contract of what will be send. You can define an outbound message at the following location:

	Setup > App Setup > Create > Workflow & Approvals > Outbound Messages
	
Here you can create a new outbound message. Just select the object that you want to (partially) receive and click next. In the next screen you can edit the outbound message by specifying which fields you want to send and which url to call when a notification is queued for transmission. Here I use a different object then account like for example the Contact and I only want to receive the following fields

* Id
* AccountId
* Birthdate
* Email
* CreatedData
* SystemModstamp

![Building an outbound message](/artifacts/outbound-message.png)


I'm only interested in this data here as this is relevant for this 'amazing' birthday discount offerings business process that I just came up with :-)

Now that we have defined the outbound message we are now able to export the wsdl for this outbound message.

![Building an outbound message](/artifacts/outbound-message-details.png)

Workflow rule
---

Now we are at a crucial section! We defined the outbound message and now need to define a 'trigger' and it took me a while before I banged my head against the wall and screaming DOH! as my initial thought was that Salesforce would have this behavior by default. This trigger action detects if the modified objects should result in an outbound message and this is called a 'workflow rule' in SalesForce. 

	Setup > App Setup > Create > Workflow & Approvals > Workflow Rules

Create a new rule and select the 'Contact' object and just define a rule that will always result in 'true'. For example that a name field should not be null like you see in my screenshot.

![Create a new workflow rule](rule.png)


Now add a workflow action and select 'Select existing action', search for 'outbound message', add your just created outbound messages and save it. Now when you add or edit contact object a notification will be queued by the workflow rule. You can verify this by browsing to:

	Setup > Administration Setup > Monitoring > Outbound MessagesJups
	
There you should see the queued notification. If the notification is already delivered then you won't see nothing here as it behaves like a queue.

![Outbound message queue](/artifacts/queue.png)


Receiving the outbound message
---

Now that we have done the SalesForce part what remains is the NServiceBus side. What we do now is basically get the wsdl for the outbound message, generate code just like the client and make a web service that accepts that contract. We must use a different namespace as the Enterprise WSDL does not contain the outbound messages which is a real shame. If any SalesForce platform developer reads this post, please include ALL outbound message contracts in the Enterprise WSDL thank you!

	svcutil /messageContract .\contactnotification.wsdl /n:*,SalesForceApi.Contacts

As you see we are now using `svcutil.exe` instead of `wsdl.exe` as this works for receiving messages. This will generate the file `contacts.cs` containing the outbound message types. But now instead of using this code as a client we are going to use it as a contract to implement our web service.

Now we need to create the message that we want to process in our own service.

	public class ContactSaveCommand
	{
		public string Id { get; set; }
		public string AccountId { get; set; }
		public string Email { get; set; }
		public DateTime CreatedUtc { get; set; }
		public DateTime ModifiedUtc { get; set; }
	}

To receive messages we need to create a service. I did that by created the following class

	[AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
	[ServiceBehavior(TransactionIsolationLevel = System.Transactions.IsolationLevel.Serializable)]
	public class ContactNotificationService : NotificationPort
	{
		readonly IBus bus;

		static readonly notificationsResponse1 ResultOk = new notificationsResponse1
		{
			notificationsResponse = new notificationsResponse
			{
				Ack = true
			}
		};

		public ContactNotificationService(IBus bus)
		{
			this.bus = bus;
		}

		[OperationBehavior(TransactionScopeRequired = true, TransactionAutoComplete = true)]
		public notificationsResponse1 notifications(notificationsRequest request)
		{
			foreach (var notificationItem in request.notifications.Notification)
			{
				Send(Convert(notificationItem.sObject));
			}

			return ResultOk;
		}

		private void Send(ContactSaveCommand cmd)
		{
			bus.Send(cmd);
		}

		private ContactSaveCommand Convert(global::Contact contact)
		{
			return new ContactSaveCommand
			{
				Id = contact.Id,
				AccountId = contact.AccountId,
				Email = contact.Email,
				CreatedUtc = contact.CreatedDate.Value,
				ModifiedUtc = contact.SystemModstamp.Value
			};
		}
	}

This class can receive a `notificationsRequest` message which can contain a batch of updates. I convert each message and send it separately but you could also use the message batching features of NServiceBus. Then you just convert the array. I don't do this here as it was not required for our solution and although this results in a lot of seperate transactions the transactions are small and just result in the updating of one record.

This class uses dependency injection (DI) to get a bus instance. Also, I did not use a *.svc file but used routing to bind a route to the service. The following code uses a Unity host factory but such factories are also available for Castle Windsor, Autofac, etc. and otherwise pretty easy to create yourself.

	var hostFactory = new UnityServiceHostFactory(container);
	var routes = RouteTable.Routes;
	routes.Add(new ServiceRoute("contact", hostFactory, typeof(ContactNotificationService)));

The code basically says, please create `ContactNotificationService` via the `UnityServiceHostFactory` when you receive a call on the path `/contact`.

Issues and warnings
===

There are a couple of issues that are not mentioned in depth in this post but really worth mentioning:

* You can model an aggregate but you will get your self in a world of pain as you will go through a rabbit hole of custom forms and all the nice stuff that salesforce offers will not be available when you go custom
* SalesForce tries to deliver notifications for 24 hours and then the message is purged. You should probably have a back-up strategy for this
* You will not receive messages when a object is deleted in SalesForce. You can solve this by
	* using logical deletes, or
	* by creating a trigger that inserts into a generic 'deletedobjects' table on which you create a seperate workflow rule and outbound message
	* run a scheduled task that queries salesforce for deleted objects (this is what we were using as this would also be the hook to make sure we received all updates in case of mayor downtime
* AFAIK is that this solution does not comply to once and only once delivery, its not durable and not ordered. This is caused by the fact that the http transport does not offer these capabilities but also because SalesForce explicitly mentions that there is not just one queue. This probably means that there infrastructure does some round-robin delivery to a large set of notification queue servers that then try to delivery notifications and these servers are not synchronized and will have different loads resulting in different delivery ordering. This requires some investment at the receiving side for example:
	* delayed processing to allow ordering
	* compensating transactions when a 'earlier' notification is received
	* de-duplication of messages when a message is received multiple times


Sourcecode
===

I made a demo solution which is available on github. I called the project [SalesForce To NServiceBus ](https://github.com/ramonsmits/sf2nsb) (sf2nsb).


Conclusion
===

This post was scheduled for a while but I never got the time to finish it. Ohad of the NServiceBus champs program asked if anybody was familiar with using Salesforce with NServiceBus for (near) real-time updates and that made me write this article.
If this article was usefull for you then please mention so in the comments, follow me on twitter (ramonsmits).

License
===

The code is provided under Creative Commons v2.0 (CC BY 2.0) so please don't forget to mention me when you use parts of it.

Further reading
===

We try to model our system as Udi Dahan applies in his Advanced Distributed Systems Design (ADSD) course. This creates a couple of interesting issues as Salesforce is not really an environment that suits this methodology. Before you dive in any further I recommend that you watch and read the following:

* [Putting your events on a diet by Andreas Öhlund](http://skillsmatter.com/podcast/home/events-diet)
* [Service-Oriented API implementations by Udi Dahan](http://www.udidahan.com/2012/12/10/service-oriented-api-implementations/)

Both of these give some food-for-thought regarding how to slice-and-dice your messages for processing notifications and make SOA flexible work for you while still having a a simple non cake layer architecture implementation.

