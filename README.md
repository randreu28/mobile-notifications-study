# Mobile Notifications Study

This project is a study about notifications technologies for mobile devices, for people who have never implemented notification features in any app. This study assumes knowledge about HTTP/HTTPS protocol, and you're curious about how notifications work under the hood. This study is language-agnostic and platform-agnostic (android, ios, web).

This readme is a summary of what I've been able to piece together after much trial and error.

## The underlying technologies

Notifications are usually daemons (background processes) that run on the user's devices always, listening for incoming messages. These daemons are specific to each platform. Here's a brief overview:

| Platform | Notification Service     | Underlying Protocol |
| -------- | ------------------------ | ------------------- |
| Android  | FirebaseMessagingService | FCM                 |
| iOS      | UNUserNotificationCenter | APNS                |
| Web      | Service Workers          | WebSocket           |

> Don't confuse Firebase with FCM. [Firebase](https://firebase.google.com/) is a SaaS plataform that offers many services (database, authentication, hosting, etc), while FCM is the underlying technology that allows us to send and receive notifications, which is somewhat rooted in the Firebase SaaS, but you can use it cost-free, independently from the rest of paid Firebase services.

Notice that, apart from the web, all the other services are proprietary and require a vendor-specific configuration. Meaning that if recieve a notification on an Android device, it will have to go through the Google's servers (FCM), and if you receive a notification on an iOS device, it will have to go through Apple's servers (APNS).

As the web is the exception, and not the rule, in this study we'll focus on the two big players: Android and iOS.

To send a notification to a device you have to:

1.  Register your app to the appropiate notification service. In the case of Android, you register your app to Firebase. In the case of iOS, you get a apple developer ID, and register your app to allow remote notifications.

> This means, going to their plataform and creating an account, filling out forms, paying a fee sometimes (in case of Apple), etc.

2.  Register a device to the appropiate notification service (FCM or APNS).

> This will call to _FirebaseMessangeService_ on Android, or _UNUserNotificationCenter_ on iOS, in platform-specific code (swift/obj-c for iOS, java/kotlin for Android).

3.  Send this token to the plataform notification service, with the apropiate data (ex, title, body, etc).

> This will be usually an HTTP request, with some kind of authentication and body.

## Is it all in the end just a REST API?

Kind of...! The main problem is the docuemntation of said API's. If you have ever worked with software of big companies like Google or Apple, you know that their documentation is... lacking, and they often are written for popular platforms and languages, and never explain the underlying mechanics.

For example, in Android the recommended way to send these http requests is by using the [autogenerated SDK](https://firebase.google.com/docs/admin/setup)'s. These SDK's do way more than just using FCM (as they are packed with the rest of Firebase services), and they are often broken, discontinuated, and only available for certain languages. To bypass them and not worry about it's quirks, it is interesting to know how to use their internal mechanisms directly.

## FCM vs APNS

When sending notifications in a plataform-agonstic way, the FCM vs APNS dilema arises. Luckily, Firebase (and, therefore, FCM) offers a mechanism to send notifications in a unified way, by registering APN's tokens in the FCM registry, and having a common endpoint to send notifications to. This is the mechanism that Firebase uses to offer a single API for sending notifications to both Android and iOS devices.

You will need to [add your Apple authentication key to the Firebase console](https://firebase.google.com/docs/cloud-messaging/ios/client#add_firebase_to_your_apple_project), and then you will be able to send notifications to your devices using the same mechanism.

## Example

Here's an example taken from the [official documentation](https://firebase.google.com/docs/cloud-messaging/send-message#rest)[^1] of a notification request to FCM:

```
POST https://fcm.googleapis.com/v1/projects/myproject-b5ae1/messages:send HTTP/1.1

Content-Type: application/json
Authorization: Bearer ya29.ElqKBGN2Ri_Uz...HnS_uNreA

{
   "message":{
      "token":"token_1",
      "data":{},
      "notification":{
        "title":"FCM Message",
        "body":"This is an FCM notification message!",
      }
   }
}
```

## Authentication

Now that we can simplify the process to an HTTP request, we just need to know how to authenticate to the FCM API.

The authentication mechanism is based on [OAuth 2.0](https://oauth.net/2/), and the flow is as follows:

### 1. Generating a service account key

A service account is an account that isn't of a person, but of an application. You would usualy have to go to the Google CLoud console and get a JSON file similar to this:

```json
{
"type": "service_account",
"project_id": "...",
"private_key_id": "...",
"private_key": "...",
"client_email": "...",
"client_id": "...",
"auth_uri": "https://accounts.google.com/o/oauth2/auth",
"token_uri": "https://oauth2.googleapis.com/token",
"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
"client_x509_cert_url": "...",
"universe_domain": "..."
}
```

Luckily you can retrieve this token using the Firebase dashobard (which is much more user-friendly).

### 2. Use the key to generate a JWT

Now that you have service account key, you can use it to create a verified JWT, which is what you pass on as Authorization bearer in the HTTP request. This follows the [OAuth 2.0](https://oauth.net/2/) protocol, and you can read more about it [here](https://developers.google.com/identity/protocols/oauth2/service-account).

![JWT](./jwt.png)

### 3. Use the JWT to authenticate your request

Now that you have a JWT, you can use it to authenticate your request. This is the token you pass on as Authorization bearer in the HTTP request.

For a full list of the headers and payload fields, you can check the [official documentation](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages).

.
