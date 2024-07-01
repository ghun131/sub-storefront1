"use client";
// app/components/SubscriptionPlanList.tsx
import { useEffect, useState } from "react";
import { PlanObject, PlanOverridesObject } from "lago-javascript-client";
import { useRouter } from "next/navigation";

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

async function fetchSubscriptionCustomer(
  externalCustomerId: string
): Promise<PlanObject[]> {
  try {
    const response = await fetch(
      `api/customer-plans?externalCustomerId=${externalCustomerId}`,
      {
        method: "GET",
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

async function createSubscriptionsCustomer(
  plans: SubscriptionInputObj[]
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`api/create-subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(plans),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export default function SubscriptionPlanList({
  plans,
}: {
  plans: PlanObject[];
}) {
  const [selectedPlans, setSelectedPlans] = useState<PlanObject[]>([]);
  const [customerPlans, setCustomerPlans] = useState<PlanObject[]>([]);
  const router = useRouter();
  const { query } = router;
  const customerExternalId = query.customerExternalId as string;

  useEffect(() => {
    (async () => {
      if (customerExternalId) {
        const subData = await fetchSubscriptionCustomer(customerExternalId);
        setCustomerPlans(subData);
      }
    })();
  }, []);

  function handleClick(plan: PlanObject) {
    const ids = new Set(selectedPlans.map((p) => p.lago_id));
    if (ids.has(plan.lago_id)) return;
    setSelectedPlans((prev) => [...prev, plan]);
  }

  function handleRemoveSub(plan: PlanObject) {
    setSelectedPlans((prev) => prev.filter((p) => p.lago_id !== plan.lago_id));
  }

  async function handleSave() {
    if (!customerExternalId) return;

    const payload: SubscriptionInputObj[] = selectedPlans.map((plan) => ({
      external_customer_id: customerExternalId,
      plan_code: plan.code,
      external_id: plan.code + "_" + new Date().getTime().toString(),
      billing_time: "calendar",
    }));
    let res = await createSubscriptionsCustomer(payload);
    if (res?.error) {
      res = await createSubscriptionsCustomer(payload);
      if (!res?.error) {
        location.reload();
      }
    }
  }

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.lago_id}
            className="bg-gray-700 bg-opacity-50 rounded-lg p-6 backdrop-blur-sm border border-gray-600"
          >
            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <p className="text-gray-300 mb-4">{plan.description}</p>
            <p className="text-3xl font-bold mb-6">
              ${plan.amount_cents / 100}/month
            </p>
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
              onClick={() => handleClick(plan)}
            >
              Select Plan
            </button>
          </div>
        ))}
      </div>
      <div>
        <h2 className="text-2xl font-bold mt-12 mb-4">Your plans:</h2>
        <ul>
          {customerPlans.map((plan) => (
            <li key={plan.lago_id} className="font-medium">
              {plan.name}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-2xl font-bold mt-12 mb-4">Selected Plans:</h2>
        <ul>
          {selectedPlans.map((plan) => (
            <li key={plan.lago_id} className="font-medium">
              <button
                className="text-xl font-bold text-red-400"
                onClick={() => handleRemoveSub(plan)}
              >
                x
              </button>
              &nbsp; &nbsp;
              {plan.name}
            </li>
          ))}
        </ul>
      </div>
      <br />
      <br />
      <div className="flex justify-center">
        {selectedPlans.length > 0 && (
          <button
            className="w-1/2  bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            onClick={handleSave}
          >
            Save
          </button>
        )}
      </div>
    </section>
  );
}
