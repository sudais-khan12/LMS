"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { DataTableProps, User } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export default function DataTable({ title, data, columns }: DataTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Inactive":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Teacher":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Student":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Admin":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className={cn(
      glassStyles.card,
      glassStyles.cardHover,
      "rounded-2xl shadow-glass-sm",
      animationClasses.scaleIn
    )}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                {columns.map((column) => (
                  <th
                    key={column}
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((user: User) => (
                <tr
                  key={user.id}
                  className="border-b border-border/30 hover:bg-muted/30 transition-colors duration-200"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/avatars/${user.name.toLowerCase().replace(' ', '-')}.jpg`} />
                        <AvatarFallback className="text-xs">
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getRoleColor(user.role))}
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getStatusColor(user.status))}
                    >
                      {user.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
