import { Twilio } from 'twilio';

export async function sendActivationCode(
  phone_number: string,
  activationCode: string,
) {
  const client = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  if (process.env.NODE_ENV === 'development') activationCode = '123456';
  client.messages
    .create({
      from: process.env.TWILIO_NUMBER,
      body: `Verification code for On-fruit is ${activationCode}`,
      to: phone_number,
    })
    .catch((err) => {
      console.log('Twilio not authenticate your number!', err);
    });
}
