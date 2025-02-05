import {postToWebhook} from "./modules/post-to-webhook.js"

const DOMready = async () => {
  return new Promise((resolve) => {
      window.addEventListener("load", resolve)
      console.debug("TDC WidgetService Ready v1.2");
  })
}

const main = async () => {
  // Wait until DOM is Ready
  await DOMready()
  
  // Connect to the postMessage API using the Widget API Lib.
  const api = await widgetApiLib.connect()

  // Add Logic here

  // Fetch Widget Options
  const receiverUrl = await api.call('widget.getOption', 'receiver-url')
  console.log(receiverUrl)

  // Widget API Call
  const customerKey = await api.get("auth.customerKey")
  postToWebhook(receiverUrl, customerKey).then((data) => { console.log(data)})
  const customerId = await api.get("auth.customerId")
  const userName = await api.get("auth.userName")
  const userId = await api.get("auth.userId")
  const userGroupId = await api.get("auth.userGroupId")

  // Do something on contact centre requests
  // Phone Calls
  const onIncomingCall = async ({call}) => {
      //postToWebhook(receiverUrl, call).then((data) => { console.log(data)})
      console.info("(TDC) InComingCall call", call);
      window.open("https://jhatest.northeurope.cloudapp.azure.com/widgetservice/jacob.htm", "_blank");
    }

  const onCallStateChange = async ({call}) => {

  }
  const onCalloutCallOrdered = async ({requestId, caller}) => {

  }

  // Chats
  const onIncomingChat = async ({chat}) => {

  }
  const onChatStateChange = async ({chat}) => {

  }
  const onChatStatusChange = async ({chat}) => {

  }
  const onChatDisconnected = async ({sessionId, msg}) => {

  }
  const onNewIncomingMessage = async ({sessionId, msg}) => {

  }

  // Emails
  const onIncomingEmail = async ({email}) => {

  }
  const onEmailStateChange = async ({email}) => {

  }
  const onEmailStatusChange = async ({email}) => {

  }

  // Social Requests
  const onIncomingSocial = async ({request}) => {

  }
  const onSocialStateChange = async ({request}) => {

  }
  const onSocialStatusChange = async ({request}) => {

  }

  // ASR
  const onAsrTrigger = async (data) => {
    console.log(data)
    postToWebhook(receiverUrl, data).then((data) => { console.log(data)})
  }

  // Subscribe to contact centre requests/states/statuses and add a state
  // Calls
  api.on("SYSTEM_INCOMING_CALL", onIncomingCall)
  api.on("SYSTEM_CALL_STATE_CHANGE", onCallStateChange)
  api.on("SYSTEM_CALLOUT_CALL_ORDERED", onCalloutCallOrdered)

  // Chats
  api.on("SYSTEM_INCOMING_CHAT", onIncomingChat)
  api.on("SYSTEM_CHAT_STATE_CHANGE", onChatStateChange)
  api.on("SYSTEM_CHAT_STATUS_CHANGE", onChatStatusChange)
  api.on("SYSTEM_CHAT_DISCONNECTED", onChatDisconnected)
  api.on("SYSTEM_CHAT_NEW_INCOMING_MSG", onNewIncomingMessage)

  // Emails
  api.on("SYSTEM_INCOMING_EMAIL", onIncomingEmail)
  api.on("SYSTEM_EMAIL_STATE_CHANGE", onEmailStateChange)
  api.on("SYSTEM_EMAIL_STATUS_CHANGE", onEmailStatusChange)

  // Social
  api.on("SYSTEM_INCOMING_SOCIAL", onIncomingSocial)
  api.on("SYSTEM_SOCIAL_STATE_CHANGE", onSocialStateChange)
  api.on("SYSTEM_SOCIAL_STATUS_CHANGE", onSocialStatusChange)
  /* Individual Social Channels can be specified as well
     Events:
     SYSTEM_INCOMING_SOCIAL_SMS_PRIVATE
     SYSTEM_INCOMING_SOCIAL_FACEBOOK_PRIVATE
     SYSTEM_INCOMING_SOCIAL_FACEBOOK_PUBLIC
     SYSTEM_INCOMING_SOCIAL_TWITTER_PUBLIC
     SYSTEM_INCOMING_SOCIAL_TWITTER_PRIVATE
     SYSTEM_INCOMING_SOCIAL_WHATSAPP_PRIVATE
     SYSTEM_INCOMING_SOCIAL_TRUSTPILOT_PUBLIC
  */

  // ASR
  api.on('SYSTEM_CALL_ASR_TRANSCRIPTION_TRIGGER', onAsrTrigger)

  // Flag that your page is ready to receive events
  api.ready()
}

// Start the Async Function
main()
