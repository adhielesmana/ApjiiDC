// "use client";

// import { Link } from "@heroui/link";
// import { ChevronRightIcon } from "@heroui/icons";

// interface BreadcrumbItem {
//   label: string;
//   href?: string;
// }

// interface BreadcrumbProps {
//   items: BreadcrumbItem[];
// }

// export default function Breadcrumb({ items }: BreadcrumbProps) {
//   return (
//     <nav className="flex items-center space-x-2 text-sm mb-6">
//       {items.map((item, index) => (
//         <div key={item.label} className="flex items-center">
//           {index > 0 && (
//             <ChevronRightIcon className="w-4 h-4 mx-2 text-default-400" />
//           )}
//           {item.href ? (
//             <Link
//               href={item.href}
//               className="text-default-600 hover:text-primary"
//             >
//               {item.label}
//             </Link>
//           ) : (
//             <span className="text-default-900 font-medium">{item.label}</span>
//           )}
//         </div>
//       ))}
//     </nav>
//   );
// }
