const { CallClient } = require("@azure/communication-calling");
const { AzureCommunicationTokenCredential } = require("@azure/communication-common")
const { CommunicationIdentityClient } = require('@azure/communication-identity');


let call;
let incomingCall;
let callAgent;
let deviceManager;
let token;
const calleeInput = document.getElementById("callee-id-input");
const submitToken = document.getElementById("token-submit");
const callButton = document.getElementById("call-button");
const hangUpButton = document.getElementById("hang-up-button");
const acceptCallButton = document.getElementById('accept-call-button');

async function genAccessToken() {
    const connectionString = 'endpoint=https://rj-acs-testing.europe.communication.azure.com/;accesskey=82ADmXybPhzpn0y31ZU82I4oqI6KyxakpmtIjNpqhPBzo2freObEJQQJ99BBACULyCpuGsnbAAAAAZCSnvCW';

    const identityClient = new CommunicationIdentityClient(connectionString);
    let identityResponse = await identityClient.createUser();
    console.log(`\nCreated an identity with ID: ${identityResponse.communicationUserId}`);

    let tokenResponse = await identityClient.getToken(identityResponse, ["voip"]);

    token = tokenResponse.token;
    console.debug('Token: \n', token);
  }

submitToken.addEventListener("click", async () => {
    await genAccessToken();
    const callClient = new CallClient();
      try {
        callAgent = await callClient.createCallAgent(new AzureCommunicationTokenCredential(token));
        deviceManager = await callClient.getDeviceManager();
        await deviceManager.askDevicePermission({ audio: true });
        callButton.disabled = false;
        submitToken.disabled = true;
        console.debug('Succesfully submitted token..')
        // Listen for an incoming call to accept.
        // callAgent.on('incomingCall', async (args) => {
        //   try {
        //     console.debug('Incoming call...')
        //     incomingCall = args.incomingCall;
        //     acceptCallButton.disabled = false;
        //     callButton.disabled = true;
        //   } catch (error) {
        //     console.error(error);
        //   }
        // });
      } catch(error) {
        console.error(error)
      }
  })

  callButton.addEventListener("click", () => {
    // start a call
    console.debug('Trying to start call...')
    try {
        call = callAgent.startCall(
            [{ phoneNumber: calleeInput.value }],
            { alternateCallerId: { phoneNumber: "+4570726768" } }
        );

        try {
            call.on('stateChanged', async (args) => {
            console.debug(call.state)
            console.debug(callAgent)
            console.debug(callAgent.kind, callAgent.displayName)
            if (call.state === 'Disconnected') {
                console.debug(call.EndReason)
                if (call.EndReason === 'undefined') {
                console.debug('Unknown error')
                }
            }
            });
        } catch (error) {
            console.error('Error handling state change:', error);
        }
        // toggle button states
        hangUpButton.disabled = false;
        callButton.disabled = true;
    } catch (error) {
        console.error('Failed to start call:', error);
    }
  });

  hangUpButton.addEventListener("click", () => {
    // end the current call
    // The `forEveryone` property ends the call for all call participants.
    call.hangUp({ forEveryone: true });
  
    // toggle button states
    hangUpButton.disabled = true;
    callButton.disabled = false;
    submitToken.disabled = false;
    acceptCallButton.disabled = true;
  });

  acceptCallButton.onclick = async () => {
    try {
      call = await incomingCall.accept();
      acceptCallButton.disabled = true;
      hangUpButton.disabled = false;
    } catch (error) {
      console.error(error);
    }
  }

 