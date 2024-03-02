import { formatCurrency } from "@/utils";
import { Order } from "../../interfaces/Order";
export default function OrderRowPartial({
  order,
  index,
  extraClass,
}: {
  order: Order;
  index: any;
  extraClass: string;
}) {
  return (
    <tr key={index} className={extraClass}>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(order.date).toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
      <td
        className={`px-6 py-4 whitespace-nowrap text-sm ${
          order.type === "buy" ? "text-green-500" : "text-red-500"
        }`}
      >
        {order.type}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatCurrency(order.averagePrice)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
      {order.type === "buy" && (
        <td className={`px-6 py-4 whitespace-nowrap text-sm text-green-500`}>
          {formatCurrency(order.totalCost)}
        </td>
      )}
      {order.type === "buy" && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
      )}
      {order.type === "sell" && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
      )}
      {order.type === "sell" && (
        <td className={`px-6 py-4 whitespace-nowrap text-sm text-red-500`}>
          {formatCurrency(order.totalCost)}
        </td>
      )}
    </tr>
  );
}
