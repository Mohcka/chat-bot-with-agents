"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";

import { useChat } from "ai/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AgentStep } from "langchain/schema";
import { Input } from "@/components/shadcn/ui/input";
import { Button } from "@/components/shadcn/ui/button";
import IntermediateStep from "@/components/IntermediateStep";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const endpoint = "/api/chat/agent";

const ChatView = () => {
  const [mounted, setMounted] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showIntermediateSteps, setShowIntermediateSteps] = useState(true);
  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading: chatEndpointIsLoading,
    setMessages,
  } = useChat({
    api: endpoint,
    onError: (e) => {
      toast(e.message, {
        theme: "dark",
      });
    },
  });

  useEffect(() => {
    setMounted(true);

    return () => {};
  }, [mounted]);

  function scrollToBottom() {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!input || isLoading) return;

    try {
      setIsLoading(true);
      setInput("");
      const messagesWithUserReply = messages.concat({
        id: messages.length.toString(),
        content: input,
        role: "user",
      });
      setMessages(messagesWithUserReply);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesWithUserReply,
          show_intermediate_steps: showIntermediateSteps,
        }),
      });

      const json = await response.json();
      setIsLoading(false);
      if (json.error) {
        toast("An error occured on the server", {
          theme: "dark",
        });
        return;
      }

      const intermediateStepMessages = (json.intermediate_steps || []).map(
        (intermediateStep: AgentStep, i: number) => ({
          id: (messagesWithUserReply.length + i).toString(),
          content: JSON.stringify(intermediateStep),
          role: "system",
        })
      );
      const newMessages = messagesWithUserReply;

      for (const msg of intermediateStepMessages) {
        newMessages.push(msg);
        setMessages([...newMessages]);
      }
      // add finale agent response to messages
      setMessages([
        ...newMessages,
        {
          id: (newMessages.length + intermediateStepMessages.length).toString(),
          content: json.output,
          role: "assistant",
        },
      ]);
    } catch (e) {
      toast("An issue has occured", {
        theme: "dark",
      });
    }
  }

  // scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl">AI Chat with Automated Agents</h2>
      <div ref={messageContainerRef} className="flex-grow overflow-y-auto">
        {messages.length > 0 ? (
          [...messages].map((message) => (
            <div
              key={message.id}
              className={cn("p-4 border-y", {
                "bg-slate-300": message.role === "assistant",
              })}
            >
              {message.role === "system" ? (
                <div className="message system">
                  <div className="message-content">
                    <IntermediateStep message={message}></IntermediateStep>
                  </div>
                </div>
              ) : (
                <div className={cn("message")}>
                  <div className="message-content">{message.content}</div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No messages yet</p>
        )}
      </div>
      <form className="my-3" onSubmit={sendMessage}>
        <div className="flex ">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Try asking What the current weather is in your location in Kelvin. What's that number to the 0.42 power? "
          ></Input>
          <Button>
            {isLoading || chatEndpointIsLoading ? <LoaderSpinner /> : "Send"}
          </Button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

const LoaderSpinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin ">
      <Loader2 size={20} color="#fff" />
    </div>
  </div>
);

export default ChatView;
