import Market from "@/app/components/Market";

export default function Page({ params }: { params: { market: string } }) {
  const { market } = params;
  return (
    <div className="container mx-auto">
      <div className="">
        <Market market={market} />
      </div>
    </div>
  );
}
