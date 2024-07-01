import { Api, Client, SubscriptionsPaginated } from "lago-javascript-client";
import { NextApiRequest, NextApiResponse } from "next";

async function getSubscriptions(
  client: Api<unknown>,
  externalCustomerId: string
): Promise<SubscriptionsPaginated> {
  try {
    const response = await client.subscriptions.findAllSubscriptions({
      external_customer_id: externalCustomerId,
      page: 1,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.data;
  } catch (error) {
    throw error;
  }
}
export default async function handleReturnSubscription(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client: Api<unknown> = Client(process.env.NEXT_API_KEY as string, {
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  });
  const exCustomerId = req.query.externalCustomerId as string;
  const subData = await getSubscriptions(client, exCustomerId);
  const planCodes = subData.subscriptions.map((sub) => sub.plan_code);
  const planPromises = planCodes.map(async (code) => {
    const response = await client.plans.findPlan(code);
    return response.data;
  });

  const planData = await Promise.all(planPromises);

  res.status(200).json(planData.map((plan) => plan.plan));
}
