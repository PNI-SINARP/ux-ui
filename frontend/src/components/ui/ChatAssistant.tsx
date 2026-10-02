"use client";

import React, { useState } from 'react';
import { X, Send, Smile, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'bot' | 'user', text: string }[]>([
        { role: 'bot', text: '¡Hola! Soy el asistente virtual del Geoportal DINARP. ¿En qué te puedo ayudar hoy?' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = (text: string) => {
        if (!text.trim()) return;
        setMessages(prev => [...prev, { role: 'user', text }]);
        setInput('');

        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'bot', text: 'He procesado tu consulta sobre la base de datos de DINARP. ¿Deseas ver más detalles?' }]);
        }, 1200);
    };

    return (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 font-sans">
            {/* Botón Flotante para abrir (Chat Launcher) */}
            {!isOpen && (
                <Button
                    variant="primary"
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 size-14 rounded-full shadow-xl hover:scale-105 transition-transform flex items-center justify-center p-0"
                >
                    <Bot className="size-7 text-primary-foreground" />
                </Button>
            )}

            {/* --- VENTANA DE CHAT --- */}
            {isOpen && (
                <div className="absolute top-1/2 -translate-y-1/2 right-20 flex h-[580px] w-[380px] flex-col overflow-hidden rounded-[2.5rem] border border-border/40 bg-surface/10 shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-right-5 duration-300">

                    {/* BLOBS DE FONDO */}
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                        {/* Blob Superior Izquierdo */}
                        <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-secondary/20 blur-[120px]"></div>
                        {/* Blob Central */}
                        <div className="absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px]"></div>
                        {/* Blob Inferior Derecho */}
                        <div className="absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-info/20 blur-[120px]"></div>
                    </div>

                    {/* Encabezado */}
                    <div className="relative z-10 flex items-center bg-surface border-b border-border justify-between px-5 py-4 text-foreground shadow-xs">
                        <div className="flex items-center gap-3">
                            <Avatar size="sm" className="bg-primary/10 shadow-xs border border-primary/20 shrink-0">
                                <AvatarFallback className="text-xs font-bold text-primary dark:text-primary-300 !bg-transparent">
                                    <Bot className="size-4 text-primary" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-left">
                                <h3 className="text-sm font-bold tracking-tight text-foreground">Asistente DINARP IA</h3>
                                <span className="text-[10px] text-success font-medium flex items-center gap-1">
                                    <span className="size-1.5 rounded-full bg-success animate-pulse inline-block" />
                                    En línea
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => setIsOpen(false)}
                                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl"
                            >
                                <X size={16} />
                            </Button>
                        </div>
                    </div>

                    {/* Área de Mensajes */}
                    <div className="relative z-10 flex-1 overflow-y-auto p-5 space-y-6">
                        {messages.map((msg, idx) => (
                            msg.role === 'bot' ? (
                                <div key={idx} className="flex items-start gap-2.5">
                                    <Avatar size="sm" className="bg-primary/10 shadow-xs border border-primary/20 shrink-0 mt-0.5">
                                        <AvatarFallback className="text-[10px] font-bold text-primary dark:text-primary-300 !bg-transparent">
                                            <Bot className="size-3.5 text-primary" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="max-w-[78%] rounded-[1.25rem] rounded-tl-sm bg-white dark:bg-surface border border-border shadow-xs text-left px-4 py-3 text-xs text-foreground">
                                        {msg.text}
                                    </div>
                                </div>
                            ) : (
                                <div key={idx} className="flex flex-col items-end gap-1">
                                    <div className="max-w-[78%] rounded-2xl rounded-tr-none bg-primary text-primary-foreground p-3.5 text-xs shadow-sm border border-primary-600/35">
                                        {msg.text}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>

                    {/* Barra de Entrada */}
                    <div className="relative z-10 p-4 bg-surface border-t border-border">
                        <Textarea
                            appearance="chat"
                            color="primary"
                            placeholder="Escribe tu consulta..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(input);
                                }
                            }}
                            showSendButton={true}
                            onSend={() => handleSend(input)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatAssistant;
