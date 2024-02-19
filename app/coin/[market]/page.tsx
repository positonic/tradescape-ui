import Project from "../../../interfaces/Project";
import metadata from "../../../metaData";
import Chart from "@/app/components/Chart";

export default function Page({ params }: { params: { market: string } }) {
  return (
    <div className="container mx-auto">
      <div className="">
        <Chart market />
      </div>
    </div>
  );
}
