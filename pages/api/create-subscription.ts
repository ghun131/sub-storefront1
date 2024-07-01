import { Api, Client, PlanOverridesObject } from "lago-javascript-client";
import { NextApiRequest, NextApiResponse } from "next";

interface SubscriptionInputObj {
  external_customer_id: string;
  plan_code: string;
  name?: string;
  external_id: string;
  billing_time?: "calendar" | "anniversary";
  ending_at?: string;
  subscription_at?: string;
  plan_overrides?: PlanOverridesObject;
}

export default async function handleCreateSubscriptions(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const client: Api<unknown> = Client(process.env.NEXT_API_KEY as string, {
      baseUrl: process.env.NEXT_PUBLIC_API_URL,
    });
    const payload = req.body;
    console.log("payload:", payload);

    try {
      const payloadPromise = payload.map(async (sub: SubscriptionInputObj) => {
        const res = await client.subscriptions.createSubscription({
          subscription: sub,
        });
        return res.data;
      });

      const response = await Promise.all(payloadPromise);
      //   const response = { hello: "world" };
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
