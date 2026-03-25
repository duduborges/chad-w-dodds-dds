"use client";

import { useState, useEffect } from "react";
import { LuShield, LuPhone } from "react-icons/lu";

const FALLBACK_PLANS = [
  "Medicaid",
  "Delta Dental",
  "Cigna",
  "Aetna",
  "MetLife",
  "United Healthcare",
  "Guardian",
  "CareCredit",
];

export default function InsuranceSection() {
  const [plans, setPlans] = useState<string[]>(FALLBACK_PLANS);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch("/api/insurance?clinic_slug=chad-w-dodds-dds");
        if (res.ok) {
          const data = await res.json();
          if (data.plans && data.plans.length > 0) {
            setPlans(data.plans.map((p: { name: string }) => p.name));
          }
        }
      } catch {
        /* use fallback */
      }
    }
    fetchPlans();
  }, []);

  return (
    <section id="insurance" className="py-20 bg-[var(--color-surface)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[var(--color-primary-50)] text-[var(--color-primary)] px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <LuShield className="w-4 h-4" />
            Insurance Accepted
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-jakarta)] text-[var(--color-text)]">
            We Work With Your Insurance
          </h2>
          <p className="mt-3 text-[var(--color-text-light)] max-w-xl mx-auto">
            We accept most major dental insurance plans. Here are some of the providers we work with.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {plans.map((plan) => (
            <div
              key={plan}
              className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-center font-medium text-[var(--color-text)] hover:border-[var(--color-primary)] hover:shadow-md transition-all duration-300 cursor-default"
            >
              <LuShield className="w-5 h-5 text-[var(--color-primary)] mx-auto mb-1.5" />
              <span className="text-sm">{plan}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-[var(--color-text-light)]">
            Don&apos;t see your plan? Call us at{" "}
            <a
              href="tel:+12087335814"
              className="text-[var(--color-primary)] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <LuPhone className="w-4 h-4" />
              (208) 733-5814
            </a>{" "}
            to verify your coverage.
          </p>
        </div>
      </div>
    </section>
  );
}
