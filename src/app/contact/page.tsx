"use client";

import { useState } from "react";
import { Column, Flex, Input, Button, Textarea, Heading, useToast } from "@/once-ui/components";
import { Text as UiText } from "@/once-ui/components";
import { contact } from "@/app/resources/content";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!response.ok) {
        throw new Error("Message could not be sent.");
      }
      
      addToast({
        message: "Message sent successfully!",
        variant: "success",
      });
      setName("");
      setEmail("");
      setMessage("");

    } catch (error) {
      addToast({
        message: "Something went wrong. Please try again.",
        variant: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Column maxWidth="s" gap="l">
      <Heading variant="display-strong-s">{contact.title}</Heading>
      <UiText variant="body-default-l">{contact.description}</UiText>
      <Flex as="form" direction="column" gap="l" onSubmit={handleSubmit}>
        <Input
          id="name"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Textarea
          id="message"
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
        />
        <Button type="submit" label="Send Message" disabled={isLoading} />
      </Flex>
    </Column>
  );
} 