var glia;
var currentEngagement;

const conversation = {
    "conversation_id":6,
    "messages":[
       {
          "type":"operator",
          "message":"Hello, thank you for calling Glia Financial. My name is Emily, and I'll be assisting you today. How can I help you?"
       },
       {
          "type":"visitor",
          "message":"Hi, Emily. My name is Michael. I wanted to ask about some of the new services you offer."
       },
       {
          "type":"operator",
          "message":"Hi, Michael. I'd be happy to help. We recently started offering various types of insurance, including auto, home, and life insurance. Is there a particular type you're interested in?"
       },
       {
          "type":"visitor",
          "message":"I'm interested in auto insurance. Can you tell me more about that?"
       },
       {
          "type":"operator",
          "message":"Of course! Our auto insurance provides comprehensive coverage options, including liability, collision, and comprehensive coverage. We also offer various discounts for safe driving, multiple policies, and more."
       },
       {
          "type":"visitor",
          "message":"That sounds good. How do I get started with purchasing auto insurance through Glia Financial?"
       },
       {
          "type":"operator",
          "message":"To get started, we can provide you with a quote. I'll need some information about your vehicle and driving history. Can you provide the make, model, and year of your vehicle, as well as your driving record?"
       },
       {
          "type":"visitor",
          "message":"Sure. My car is a 2018 Honda Accord, and I have a clean driving record with no accidents or violations."
       },
       {
          "type":"operator",
          "message":"Thank you, Michael. I'll input this information and generate a quote for you. This will just take a moment."
       },
       {
          "type":"visitor",
          "message":"Alright, thanks."
       },
       {
          "type":"operator",
          "message":"I've generated your quote. For comprehensive coverage, including liability, collision, and comprehensive insurance, your premium would be $75 per month. Does that sound good to you?"
       },
       {
          "type":"visitor",
          "message":"Yes, that sounds reasonable. How do I proceed with purchasing the policy?"
       },
       {
          "type":"operator",
          "message":"Great! I can help you complete the purchase over the phone. I'll need to confirm a few details and get your payment information. Are you ready to proceed?"
       },
       {
          "type":"visitor",
          "message":"Yes, I'm ready."
       },
       {
          "type":"operator",
          "message":"Perfect. I'll just need to confirm your full name, address, and preferred payment method."
       },
       {
          "type":"visitor",
          "message":"My full name is Michael Brown, my address is 123 Oak Street, Springfield, and I'll use my credit card for the payment."
       },
       {
          "type":"operator",
          "message":"Thank you, Michael. Your auto insurance policy is now active. You'll receive your policy documents via email shortly. Is there anything else I can assist you with today?"
       },
       {
          "type":"visitor",
          "message":"No, that's all. Thanks for your help, Emily."
       },
       {
          "type":"operator",
          "message":"You're welcome, Michael. If you have any other questions or need further assistance, feel free to call us back. Have a great day!"
       },
       {
          "type":"visitor",
          "message":"You too. Goodbye."
       },
       {
          "type":"operator",
          "message":"Goodbye."
       }
    ]
 };

 function wireUp() {
    alert("Wire Up Triggered.");
    sm.getApi({ version: 'v1' }).then(function (api) {
    glia = api;
    glia.queueForEngagement('text', { queueId: '76dbea19-92f7-4e8b-8c6d-de99280b7bcd' })
    glia.addEventListener(glia.EVENTS.ENGAGEMENT_START, engagementStarted);
    });
 }

function engagementStarted(engagement) {
    console.log("Engagement Started");
    currentEngagement = engagement;
    engagement.chat.addEventListener(engagement.chat.EVENTS.MESSAGES, messageReceived);
}

function messageReceived(messages) {
    const messageCount = messages.length;
    const lastMessage = messages[0];

    if (messageCount >= conversation.messages.length) {
        currentEngagement.end().then(() => {
            alert("Engagement Over");
        });
    }else if (lastMessage.sender == 'operator') {
        const visitorResponse = conversation.messages[messageCount];

        if (visitorResponse.type == 'visitor') {
            currentEngagement.chat.sendMessage(visitorResponse.message, null);
        }
    }
} 