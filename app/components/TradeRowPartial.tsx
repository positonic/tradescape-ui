import { formatDateTime } from "@/utils";
import { Trade } from "../../interfaces/Trade";

export default function TradeRow({ trade }: { trade: Trade }) {
  return (
    <tr key={trade.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDateTime(trade.time)}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {trade.type}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {trade.vol}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {trade.pair.split("/")[0]}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {trade.exchange}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {trade.price}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {trade.cost}
      </td>
    </tr>
  );
}
