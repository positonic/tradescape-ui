// import Project from "../../../interfaces/Project";
// import metadata from "../../../metaData";

import Balances from "@/app/components/Balances";

export default function Page({ params }: { params: { market: string } }) {
  const { market } = params;
  return (
    <div className="container mx-auto">
      <div className="">
        <h2>Balances</h2>
        <Balances />
      </div>
    </div>
  );
}
