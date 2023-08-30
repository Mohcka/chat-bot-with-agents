"use client";

import { Message } from "ai";
import { AgentStep } from "langchain/schema";
import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn/ui/accordion";

type Props = {
  message: Message;
};

const IntermediateStep = ({ message }: Props) => {
  const parsedInput: AgentStep = JSON.parse(message.content);
  const action = parsedInput.action;
  const observation = parsedInput.observation;

  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Accordion
        type="single"
        collapsible
        className="border  rounded"
      >
        <AccordionItem value="item-1"  className="w last:border-b-0">
          <AccordionTrigger>
            <div className="px-3">
              Tool Used:{" "}
              <code className="bg-slate-300 rounded p-0.5">{action.tool}</code>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="bg-slate-100 pb-2 pt-1 px-3">
              <div>
                <p>Tool Input:</p>
                <code className="bg-slate-300 rounded p-0.5">
                  {JSON.stringify(action.toolInput)}
                </code>
              </div>
              <div className="py-1" />
              <div>
                <p>Observation:</p>
                <code className="bg-slate-300 rounded p-0.5">
                  {JSON.stringify(observation)}
                </code>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default IntermediateStep;
