"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "@/lib/axios";
import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { addToast } from "@heroui/toast";
import { Loader2, UserX, Search, AlertTriangle } from "lucide-react";
import { Pagination } from "@heroui/pagination";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";

interface User {
  _id: string;
  username: string;
  fullName: string;
  phone: string;
  email: string;
  roleType: string;
  _isActive: boolean;
  _isDeleted: boolean;
  company?: string;
  isPj?: boolean;
  provider?: string;
}

export default function MemberManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterValue, setFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDelistModalOpen, setIsDelistModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/provider/member");
      if (res.data.status === "ok") {
        setUsers((res.data.data || []).filter((u: User) => !u.isPj));
      } else {
        setUsers([]);
      }
    } catch (error: any) {
      setUsers([]);
      addToast({
        title: "Error",
        color: "danger",
        description: error.response?.data?.message || "Failed to fetch members",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelistClick = (userId: string) => {
    setSelectedUserId(userId);
    setIsDelistModalOpen(true);
  };

  const handleDelist = async () => {
    if (!selectedUserId) return;

    try {
      setLoading(true);
      const res = await axios.post(
        `/api/provider/member/delist/${selectedUserId}`
      );
      if (res.data.status === "ok") {
        addToast({
          title: "Success",
          color: "success",
          description: "Member delisted successfully",
        });
        fetchUsers();
      } else {
        throw new Error(res.data.message || "Failed to delist member");
      }
    } catch (error: any) {
      addToast({
        title: "Error",
        color: "danger",
        description: error.response?.data?.message || "Failed to delist member",
      });
    } finally {
      setLoading(false);
      setIsDelistModalOpen(false);
      setSelectedUserId(null);
    }
  };

  const filteredItems = useMemo(() => {
    const filtered = [...users];
    if (filterValue) {
      return filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(filterValue.toLowerCase()) ||
          user.username.toLowerCase().includes(filterValue.toLowerCase()) ||
          user.email.toLowerCase().includes(filterValue.toLowerCase()) ||
          user.company?.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filtered;
  }, [users, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);
  const currentItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [filteredItems, page, rowsPerPage]);

  return (
    <div className="space-y-6">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-3">Member Management</h1>
          <p className="opacity-90 max-w-2xl">
            Manage your organization members here. You can view and delist
            members as needed.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-3 items-center">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-default-300"
                  size={20}
                />
                <Input
                  placeholder="Search by name..."
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="pl-10 w-full sm:w-[280px]"
                  size="lg"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No members found
            </div>
          ) : (
            <>
              <Table aria-label="Member list" className="min-h-full">
                <TableHeader>
                  <TableColumn>Full Name</TableColumn>
                  <TableColumn>Username</TableColumn>
                  <TableColumn>Email</TableColumn>
                  <TableColumn>Phone</TableColumn>
                  <TableColumn>Company</TableColumn>
                  <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                  {currentItems.map((user) => (
                    <TableRow
                      key={user._id}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.company || "-"}</TableCell>
                      <TableCell>
                        <Button
                          color="danger"
                          size="sm"
                          variant="flat"
                          startContent={<UserX size={16} />}
                          onClick={() => handleDelistClick(user._id)}
                        >
                          Delist
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="py-4 flex justify-center">
                <Pagination
                  total={pages}
                  page={page}
                  onChange={setPage}
                  classNames={{
                    cursor: "bg-primary text-white font-medium",
                    base: "gap-1",
                    item: "w-8 h-8",
                    prev: "bg-default-100",
                    next: "bg-default-100",
                  }}
                  showControls
                  size="sm"
                  radius="lg"
                  variant="flat"
                />
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Delist Confirmation Modal */}
      <Modal
        isOpen={isDelistModalOpen}
        onOpenChange={(open) => {
          setIsDelistModalOpen(open);
          if (!open) setSelectedUserId(null);
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Delist</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delist this member? This action cannot be
              undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={() => setIsDelistModalOpen(false)}
            >
              Cancel
            </Button>
            <Button color="danger" onPress={handleDelist} isLoading={loading}>
              Delist Member
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
