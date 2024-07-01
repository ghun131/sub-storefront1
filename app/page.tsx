// import SubscriptionPlanList from "@/components/SubscriptionPlanList";
import { Api, Client, PlansPaginated } from "lago-javascript-client";

async function getPlans(client: Api<unknown>): Promise<PlansPaginated> {
  try {
    const response = await client.plans.findAllPlans({ per_page: 10, page: 1 });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
}

export default async function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Choose Your Subscription Plan
      </h1>
    </div>
  );
}
