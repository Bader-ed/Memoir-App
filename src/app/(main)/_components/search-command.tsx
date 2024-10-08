"use client";

import { useEffect, useState } from "react";
import { File, Search } from "lucide-react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";

import { useSearch } from "@/hooks/search-hook";
import { api } from "../../../../convex/_generated/api";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import { Input } from "@nextui-org/input";
import { useLocalization } from "../contexts/LocalizationContext";

export const SearchCommand = () => {
  const { user } = useUser();
  const router = useRouter();
  const documents = useQuery(api.documents.getSearch);
  const [isMounted, setIsMounted] = useState(false);
  const { dict } = useLocalization();
  const placeholderMessage = dict.components.searchCommand.placeholder.replace("{fullName}", user?.username || "User");

  const toggle = useSearch((store) => store.toggle);
  const isOpen = useSearch((store) => store.isOpen);
  const onClose = useSearch((store) => store.onClose);

  const [search, setSearch] = useState("");

  const filterDocuments = documents?.filter((document) => {
    return document.title.toLowerCase().includes(search.toLowerCase());
  });

  const onClick = (documentId: string) => {
    router.push(`/documents/${documentId}`);
    onClose();
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  if (!isMounted) {
    return null;
  }

  return (
    // <div className="flex flex-col w-full justify-center items-center">
    <Popover
      // className="justify-center items-center"
      isOpen={isOpen}
      onOpenChange={onClose}
      // onClose={onClose}
      backdrop="blur"
      // side={(e) => {
      //   // Return true if onClose should be called
      //   return true;
      // }}
      shouldCloseOnBlur={true}
      shouldCloseOnInteractOutside={(e) => {
        // Return true if onClose should be called
        return true;
      }}
      placement="top"
    >
      <PopoverTrigger>
        <div></div>
      </PopoverTrigger>
      <PopoverContent>
        <div className="text-sm">
          <div className="flex items-center gap-x-1 p-2">
            <Search className="mr-3" />
            <Input
              variant="faded"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholderMessage}
            />
          </div>
          <div className="mt-2 px-1 pb-1">
            <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
              {dict.components.searchCommand.notFound}
            </p>
            {filterDocuments?.map((document) => (
              <div
                key={document._id}
                role="button"
                onClick={() => onClick(document._id)}
                className="text-sm my-1 py-2 rounded-md w-full hover:bg-secondary/15 flex place-items-center text-secondary "
              >
                {document.icon ? (
                  <p className="mr-2  pl-2 text-[18px]">{document.icon}</p>
                ) : (
                  <File className="mr-2 ml-2 h-4 w-4" />
                )}
                <span className="truncate ">{document.title}</span>
                <div className="flex  items-center"></div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
    // </div>
  );
};
