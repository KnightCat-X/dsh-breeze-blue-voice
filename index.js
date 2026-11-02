
import { BreezeBlueClient } from "@breeze.blue/sdk";

export const name = "breeze-blue-voice";

export const inject = ["petApi7340"];

const VOICE_ID = "voc_8yud7hz7c9q2";

export function apply(ctx) {
  const apiKey = process.env.BREEZE_API_KEY;

  if (!apiKey) {
    console.error(
      "[BreezeBlue Voice] Missing BREEZE_API_KEY environment variable."
    );
    return;
  }

  const client = new BreezeBlueClient({
    apiKey,
  });

  const petApi = ctx.get("petApi7340");

  ctx.effect(() =>
    petApi.voice.register({
      id: "breeze-blue",
      name: "Breeze Blue",

      async synthesize({ text, rate }) {
        // 将 dsh-pet 的语速百分比转换为 Breeze Blue speed
        const match = /^([+-])(\d+(?:\.\d+)?)%$/.exec(rate);

        if (!match) {
          throw new Error(`Invalid speech rate: ${rate}`);
        }

        const percent =
          Number(match[2]) * (match[1] === "-" ? -1 : 1);

        if (percent < -50 || percent > 100) {
          throw new Error(`Speech rate out of range: ${rate}`);
        }

        const speed = 1 + percent / 100;

        console.log(
          `[BreezeBlue Voice] Generating speech, speed=${speed}`
        );

        const audio = await client.textToSpeech.convert(
          VOICE_ID,
          {
            text,
            voiceSettings: {
              speed,
            },
          },
          {
            outputFormat: "mp3",
          }
        );

        return await audio.bytes();
      },
    })
  );

  console.log("[BreezeBlue Voice] Provider registered.");
}
