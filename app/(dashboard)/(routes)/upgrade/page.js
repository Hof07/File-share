// import PricingCards from '@/app/_components/PricingCards'

import PricingCards from "./_components/Card";

export default function UpgradePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Choose <span className='text-primary'>Your</span> Plan</h1>
      <PricingCards />
    </div>
  )
}
