<script lang="ts">
	import { fly } from 'svelte/transition';
	import { tick } from 'svelte';

	interface Message {
		id: number;
		from: 'user' | 'agent';
		text: string;
		ts: Date;
	}

	let open = $state(false);
	let messages = $state<Message[]>([]);
	let inputText = $state('');
	let typing = $state(false);
	let unread = $state(0);
	let messagesEl = $state<HTMLElement | null>(null);

	const QUICK_REPLIES = ['Track my order', 'Start a return', 'Sizing help'];

	function fmt(d: Date) {
		return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
	}

	$effect(() => {
		if (open) {
			unread = 0;
			if (messages.length === 0) greet();
		}
	});

	$effect(() => {
		// Track messages + typing so this re-runs when either changes
		messages.length;
		typing;
		tick().then(() => {
			if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
		});
	});

	async function greet() {
		typing = true;
		await delay(800);
		typing = false;
		addAgent("Hi there! I'm Sophie from FORM. support 👋 How can I help you today?");
	}

	function addAgent(text: string) {
		messages = [...messages, { id: Date.now(), from: 'agent', text, ts: new Date() }];
		if (!open) unread++;
	}

	async function send(preset?: string) {
		const t = (preset ?? inputText).trim();
		if (!t || typing) return;
		inputText = '';
		messages = [...messages, { id: Date.now(), from: 'user', text: t, ts: new Date() }];
		typing = true;
		await delay(850 + Math.random() * 550);
		typing = false;
		addAgent(respond(t));
	}

	function respond(text: string): string {
		const l = text.toLowerCase();
		if (/\b(hi|hello|hey|hiya|morning|afternoon)\b/.test(l))
			return "Hey! Good to hear from you. What can I help with today?";
		if (/\b(return|refund|send.?back)\b/.test(l))
			return "Returns are free within 30 days of delivery. Head to your order page and click 'Return items' — we'll generate a prepaid label for you right away.";
		if (/start a return/i.test(l))
			return "Of course! Go to your order confirmation page and click the 'Return items' button. It takes less than 2 minutes and the label is ready instantly.";
		if (/track.*(my )?order|where.*(is|s) my|order status/i.test(l))
			return "Happy to help! Could you share your order number? I'll pull up the latest status for you.";
		if (/sizing help|size guide|what size|which size/i.test(l))
			return "Size guides are on every product page — click 'Size guide' next to the size selector. Generally: size up for tops if you're between sizes, and go true to size for footwear.";
		if (/\b(size|sizing|fit|measurement)\b/.test(l))
			return "Our size guides cover chest, waist, and foot measurements. You'll find them on each product page. If you're still unsure, feel free to tell me the product and I can advise!";
		if (/\b(deliver|shipping|dispatch|how long|when will|arrive)\b/.test(l))
			return "Standard delivery is 2–3 business days after dispatch. Orders over €100 ship free — otherwise it's €4.99 flat. You'll get a tracking link by email as soon as your parcel ships.";
		if (/\b(payment|pay|charge|card|invoice|receipt|vat)\b/.test(l))
			return "All prices include VAT — no surprises at checkout. We accept all major debit and credit cards. You're only charged once the order is confirmed.";
		if (/\b(exchange|swap|different size)\b/.test(l))
			return "Yes! During the return flow, just select 'Exchange for a different size' when choosing your reason. Your replacement ships as soon as we receive the return.";
		if (/\b(cancel|cancell)\b/.test(l))
			return "Orders can be cancelled before they ship. Could you share your order number? I'll check whether it's still possible to catch it.";
		if (/\d{3,}/.test(l) && messages.some((m) => m.from === 'agent' && m.text.includes('order number')))
			return `Let me check that… ✓ Your order is currently being packed and should ship within 1–2 business days. You'll receive a tracking email once it's on its way.`;
		if (/\b(thank|thanks|cheers|perfect|great|helpful|brilliant|appreciate)\b/.test(l))
			return "Happy to help! 😊 Is there anything else I can do for you?";
		return "I've noted that for you. Our team will follow up within 1 business day. You can also reach us directly at hello@form.com — we always reply promptly.";
	}

	function delay(ms: number) {
		return new Promise<void>((r) => setTimeout(r, ms));
	}

	let showQuickReplies = $derived(
		messages.length === 1 && messages[0].from === 'agent' && !typing
	);
</script>

<!-- Toggle button -->
<div class="fixed bottom-6 right-6 z-50 print:hidden">
	{#if !open && unread > 0}
		<span
			class="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
		>
			{unread}
		</span>
	{/if}
	<button
		onclick={() => (open = !open)}
		aria-label={open ? 'Close support chat' : 'Open support chat'}
		class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition-all hover:bg-gray-700 hover:shadow-xl active:scale-95"
	>
		{#if open}
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		{:else}
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
			</svg>
		{/if}
	</button>
</div>

<!-- Chat panel -->
{#if open}
	<div
		transition:fly={{ y: 12, duration: 180 }}
		class="fixed bottom-22 right-6 z-50 flex h-[480px] w-80 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl print:hidden"
	>
		<!-- Header -->
		<div class="flex shrink-0 items-center gap-3 bg-gray-900 px-4 py-3.5">
			<div class="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white">
				S
				<span class="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-gray-900 bg-green-400"></span>
			</div>
			<div class="min-w-0 flex-1">
				<p class="text-sm font-semibold text-white">FORM. Support</p>
				<p class="text-[11px] text-gray-400">Sophie · Usually replies in minutes</p>
			</div>
			<button
				onclick={() => (open = false)}
				class="shrink-0 text-gray-400 transition-colors hover:text-white"
				aria-label="Close chat"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Messages -->
		<div bind:this={messagesEl} class="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
			{#each messages as msg (msg.id)}
				<div class="flex {msg.from === 'user' ? 'justify-end' : 'items-end gap-2'}">
					{#if msg.from === 'agent'}
						<div
							class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white"
						>
							S
						</div>
					{/if}
					<div class="max-w-[80%]">
						<div
							class="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
							{msg.from === 'user'
								? 'rounded-br-sm bg-gray-900 text-white'
								: 'rounded-bl-sm bg-gray-100 text-gray-800'}"
						>
							{msg.text}
						</div>
						<p class="mt-1 text-[10px] text-gray-400 {msg.from === 'user' ? 'text-right' : ''}">
							{fmt(msg.ts)}
						</p>
					</div>
				</div>
			{/each}

			<!-- Typing indicator -->
			{#if typing}
				<div class="flex items-end gap-2">
					<div
						class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white"
					>
						S
					</div>
					<div class="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3.5">
						<div class="flex items-center gap-1">
							<span
								class="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
								style="animation-delay: 0ms"
							></span>
							<span
								class="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
								style="animation-delay: 150ms"
							></span>
							<span
								class="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
								style="animation-delay: 300ms"
							></span>
						</div>
					</div>
				</div>
			{/if}

			<!-- Quick replies after greeting -->
			{#if showQuickReplies}
				<div class="flex flex-wrap gap-2">
					{#each QUICK_REPLIES as qr}
						<button
							onclick={() => send(qr)}
							class="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900"
						>
							{qr}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Input -->
		<div class="shrink-0 border-t border-gray-100 p-3">
			<div
				class="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 transition-colors focus-within:border-gray-400 focus-within:bg-white"
			>
				<input
					type="text"
					bind:value={inputText}
					onkeydown={(e) => {
						if (e.key === 'Enter') send();
					}}
					placeholder="Type a message…"
					class="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 border-none ring-0 focus:outline-none focus:ring-0[&::-webkit-search-cancel-button]:hidden"
				/>
				<button
					onclick={() => send()}
					disabled={!inputText.trim() || typing}
					aria-label="Send"
					class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white transition-colors hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400"
				>
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
						/>
					</svg>
				</button>
			</div>
			<p class="mt-1.5 text-center text-[10px] text-gray-300">FORM. · University prototype · Not real support</p>
		</div>
	</div>
{/if}
