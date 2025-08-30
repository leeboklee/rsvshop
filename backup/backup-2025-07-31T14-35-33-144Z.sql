--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Booking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Booking" (
    id text NOT NULL,
    "userId" text,
    "totalAmount" double precision NOT NULL,
    "checkInDate" timestamp(3) without time zone NOT NULL,
    "checkOutDate" timestamp(3) without time zone NOT NULL,
    "guestName" text NOT NULL,
    "guestPhone" text NOT NULL,
    "guestEmail" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "roomId" text,
    "commissionAmount" double precision DEFAULT 0 NOT NULL,
    "commissionRate" double precision DEFAULT 0 NOT NULL,
    "discountAmount" double precision DEFAULT 0 NOT NULL,
    "discountType" text DEFAULT 'NONE'::text NOT NULL,
    "guestCount" integer DEFAULT 1 NOT NULL,
    memo text,
    "originalPrice" double precision DEFAULT 0 NOT NULL,
    "paymentMethod" text DEFAULT 'CARD'::text NOT NULL,
    "shoppingMall" text,
    "shoppingMallId" text,
    source text DEFAULT 'ADMIN'::text NOT NULL,
    "specialRequests" text,
    "supplyPrice" double precision DEFAULT 0 NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL
);


ALTER TABLE public."Booking" OWNER TO postgres;

--
-- Name: BookingItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BookingItem" (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    "packageId" text NOT NULL,
    price double precision NOT NULL,
    quantity integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BookingItem" OWNER TO postgres;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: Hotel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Hotel" (
    id text NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    phone text,
    email text,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Hotel" OWNER TO postgres;

--
-- Name: Inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Inventory" (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "roomId" text NOT NULL,
    "packageId" text,
    "totalCount" integer NOT NULL,
    "bookedCount" integer DEFAULT 0 NOT NULL,
    "isBlocked" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Inventory" OWNER TO postgres;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "userId" text,
    "totalAmount" double precision NOT NULL,
    "customerName" text NOT NULL,
    "customerEmail" text,
    "customerPhone" text,
    "shippingAddress" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "billingAddress" text,
    status text DEFAULT 'PENDING'::text NOT NULL
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    price double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: Package; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Package" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    price double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "hotelId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Package" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    price double precision NOT NULL,
    "imageUrl" text,
    "categoryId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: Room; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Room" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    capacity integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "hotelId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    price double precision DEFAULT 0 NOT NULL
);


ALTER TABLE public."Room" OWNER TO postgres;

--
-- Name: ShoppingMall; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ShoppingMall" (
    id text NOT NULL,
    name text NOT NULL,
    "commissionRate" double precision DEFAULT 0 NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ShoppingMall" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    role text DEFAULT 'USER'::text NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Booking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Booking" (id, "userId", "totalAmount", "checkInDate", "checkOutDate", "guestName", "guestPhone", "guestEmail", notes, "createdAt", "updatedAt", "roomId", "commissionAmount", "commissionRate", "discountAmount", "discountType", "guestCount", memo, "originalPrice", "paymentMethod", "shoppingMall", "shoppingMallId", source, "specialRequests", "supplyPrice", status) FROM stdin;
08a872e7-4caa-42f6-ac9c-061254226387	\N	0	2025-08-01 00:00:00	2025-08-03 00:00:00	김철수	01012345678	kim@test.com	\N	2025-07-31 14:34:49.158	2025-07-31 14:34:49.158	\N	7500	5	0	NONE	2	\N	0	CARD	\N	efe1bda0-dab6-433f-88d8-1761934afb90	ADMIN	\N	142500	CONFIRMED
\.


--
-- Data for Name: BookingItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BookingItem" (id, "bookingId", "packageId", price, quantity, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, name, description, "createdAt", "updatedAt") FROM stdin;
55121e37-fd35-4c86-874d-7dfd5caf6f2c	전자제품	스마트폰, 노트북, 태블릿 등	2025-07-31 14:33:44.623	2025-07-31 14:33:44.623
b7273d7b-2607-4942-9eb2-c77faa7135f9	패션	의류, 신발, 가방 등	2025-07-31 14:33:44.625	2025-07-31 14:33:44.625
9e4de66e-8631-454c-b977-2e85fab033c9	뷰티	화장품, 향수, 스킨케어 등	2025-07-31 14:33:44.627	2025-07-31 14:33:44.627
abe7a152-ff7e-484b-a070-1b028778119e	식품	신선식품, 가공식품, 건강식품 등	2025-07-31 14:33:44.629	2025-07-31 14:33:44.629
\.


--
-- Data for Name: Hotel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Hotel" (id, name, address, phone, email, description, "isActive", "createdAt", "updatedAt") FROM stdin;
e5a09bc6-59f6-4377-beb1-9576ff1aba5f	그랜드 호텔	서울시 강남구 테헤란로 123	02-1234-5678	info@grandhotel.com	최고급 호텔	t	2025-07-31 14:33:44.607	2025-07-31 14:33:44.607
\.


--
-- Data for Name: Inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Inventory" (id, date, "roomId", "packageId", "totalCount", "bookedCount", "isBlocked", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "userId", "totalAmount", "customerName", "customerEmail", "customerPhone", "shippingAddress", notes, "createdAt", "updatedAt", "billingAddress", status) FROM stdin;
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, "orderId", "productId", quantity, price, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Package; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Package" (id, name, description, price, "createdAt", "updatedAt", "hotelId", "isActive") FROM stdin;
037188d7-7eba-4502-808b-2053d44df4c0	조식 패키지	아침 식사 포함	15000	2025-07-31 14:33:44.618	2025-07-31 14:33:44.618	e5a09bc6-59f6-4377-beb1-9576ff1aba5f	t
25698999-d514-42f9-a234-c49e283e3f1f	스파 패키지	스파 서비스 포함	50000	2025-07-31 14:33:44.621	2025-07-31 14:33:44.621	e5a09bc6-59f6-4377-beb1-9576ff1aba5f	t
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, name, description, price, "imageUrl", "categoryId", "createdAt", "updatedAt") FROM stdin;
c3d7863a-fe04-484e-80c1-6fe79b25dfa3	삼성 갤럭시 S24	최신 스마트폰, 256GB	1200000	\N	55121e37-fd35-4c86-874d-7dfd5caf6f2c	2025-07-31 14:33:44.631	2025-07-31 14:33:44.631
3d1064c8-f84f-4f99-a6a4-37f05cc5d77f	LG OLED TV 65인치	4K OLED 디스플레이	2500000	\N	55121e37-fd35-4c86-874d-7dfd5caf6f2c	2025-07-31 14:33:44.633	2025-07-31 14:33:44.633
e7fce564-4299-4e88-b02f-8f321d5ee1f9	애플 맥북 프로 14인치	M3 칩 탑재, 512GB	2800000	\N	55121e37-fd35-4c86-874d-7dfd5caf6f2c	2025-07-31 14:33:44.635	2025-07-31 14:33:44.635
69195f97-41cc-459c-9d73-ac4b38e610b1	아이패드 프로 12.9인치	M2 칩, 256GB, Wi-Fi	1500000	\N	55121e37-fd35-4c86-874d-7dfd5caf6f2c	2025-07-31 14:33:44.636	2025-07-31 14:33:44.636
310a176f-847e-43be-8601-1723e567d246	나이키 에어맥스 270	편안한 쿠션감의 운동화	180000	\N	b7273d7b-2607-4942-9eb2-c77faa7135f9	2025-07-31 14:33:44.637	2025-07-31 14:33:44.637
6167bf20-f0f0-4da7-9bed-019f9e2a9779	유니클로 후드티	베이직한 디자인의 후드티	39000	\N	b7273d7b-2607-4942-9eb2-c77faa7135f9	2025-07-31 14:33:44.638	2025-07-31 14:33:44.638
af0d9541-b0ef-4449-9bc6-c96a803c3fe9	샤넬 클래식 플랩백	명품 가방, 중고품	8000000	\N	b7273d7b-2607-4942-9eb2-c77faa7135f9	2025-07-31 14:33:44.639	2025-07-31 14:33:44.639
1f7aa016-1cbb-4f8f-bb24-b28f553812fa	지방시 반팔 티셔츠	고급스러운 디자인의 티셔츠	450000	\N	b7273d7b-2607-4942-9eb2-c77faa7135f9	2025-07-31 14:33:44.64	2025-07-31 14:33:44.64
5f8afb38-bd42-4c8b-8ade-952e59b2c746	라네즈 워터뱅크 크림	수분감 가득한 보습 크림	28000	\N	9e4de66e-8631-454c-b977-2e85fab033c9	2025-07-31 14:33:44.641	2025-07-31 14:33:44.641
a2a310d9-8002-4af5-b978-9ebf86582097	아이오페 슈퍼바이탈 크림	탄력과 주름 개선 크림	35000	\N	9e4de66e-8631-454c-b977-2e85fab033c9	2025-07-31 14:33:44.642	2025-07-31 14:33:44.642
fee39f39-ee7d-41bd-bc12-e6e4edf9c636	디올 루쥬 립스틱	고급스러운 컬러의 립스틱	45000	\N	9e4de66e-8631-454c-b977-2e85fab033c9	2025-07-31 14:33:44.645	2025-07-31 14:33:44.645
add15fca-c7e5-4d51-b839-f4758d688b65	샤넬 샹스 오뗑	클래식한 향수의 향	180000	\N	9e4de66e-8631-454c-b977-2e85fab033c9	2025-07-31 14:33:44.647	2025-07-31 14:33:44.647
271e1f9b-1745-4d62-8037-2256f0c15077	농심 신라면	국민 라면, 5봉지	4500	\N	abe7a152-ff7e-484b-a070-1b028778119e	2025-07-31 14:33:44.648	2025-07-31 14:33:44.648
2b437962-55de-4eb3-bd3d-52032330c586	오리온 초코파이	달콤한 초코파이, 12개	3500	\N	abe7a152-ff7e-484b-a070-1b028778119e	2025-07-31 14:33:44.649	2025-07-31 14:33:44.649
1b1fec50-f723-46ac-a622-56823c995694	롯데 칠성사이다	시원한 탄산음료, 1.5L	1800	\N	abe7a152-ff7e-484b-a070-1b028778119e	2025-07-31 14:33:44.65	2025-07-31 14:33:44.65
90ccf093-2ccd-44f0-97a7-007c85cf52e0	해태 허니버터칩	달콤짭짭한 과자, 60g	1200	\N	abe7a152-ff7e-484b-a070-1b028778119e	2025-07-31 14:33:44.651	2025-07-31 14:33:44.651
\.


--
-- Data for Name: Room; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Room" (id, name, description, capacity, "createdAt", "updatedAt", "hotelId", "isActive", price) FROM stdin;
e83cf250-cd06-4708-b7fd-5f79f1d7eda5	디럭스 더블	2명 수용 가능한 디럭스 더블룸	2	2025-07-31 14:33:44.613	2025-07-31 14:33:44.613	e5a09bc6-59f6-4377-beb1-9576ff1aba5f	t	150000
f4fcaa7c-313c-4d1d-9564-597bcc841ed5	스위트	4명 수용 가능한 프리미엄 스위트	4	2025-07-31 14:33:44.617	2025-07-31 14:33:44.617	e5a09bc6-59f6-4377-beb1-9576ff1aba5f	t	300000
\.


--
-- Data for Name: ShoppingMall; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShoppingMall" (id, name, "commissionRate", description, "isActive", "createdAt", "updatedAt") FROM stdin;
efe1bda0-dab6-433f-88d8-1761934afb90	네이버 쇼핑	5	네이버 쇼핑몰 연동	t	2025-07-31 13:53:06.694	2025-07-31 13:53:06.694
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, name, "createdAt", "updatedAt", role) FROM stdin;
d1428f34-9b59-4c0e-9fee-48d6f25eed9b	admin@rsvshop.com	admin123	관리자	2025-07-31 14:33:44.604	2025-07-31 14:33:44.604	ADMIN
e44fb2d6-b8c4-44fc-ae8f-89f0592809b6	user1@example.com	user123	홍길동	2025-07-31 14:33:44.606	2025-07-31 14:33:44.606	USER
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
24d60965-2e11-48cb-8e0d-f27cac96d874	6db12b4b58a34eb8030f1598846481547071fe711b555a9b3548b7e8f22e918f	2025-07-31 22:50:57.062715+09	20250725085111_rsvshop	\N	\N	2025-07-31 22:50:56.906474+09	1
1e9c9be6-7627-4672-9148-0820eca4c5a4	9917e40a051e92708d2c44ad61c45ccd7001f69e7aa121cbef5a8cbe33b14e9b	2025-07-31 22:50:57.080273+09	20250726160629_fix_relations_and_add_booking_item	\N	\N	2025-07-31 22:50:57.063693+09	1
020952ce-2b13-4210-9391-dadc55c188ab	5d53ccbcaadc16ae0157c4abe9fed4a19ce6d9621cd77db179b7ea2c2b96eb4c	2025-07-31 22:50:57.17538+09	20250727102645_add_shopping_mall	\N	\N	2025-07-31 22:50:57.081183+09	1
186873ee-58ea-459c-a2a8-2dc6f5a80933	897180dadaa9b076ea4c4cd8f7a90b3b9eaf422e431728655f5e562ee208911d	2025-07-31 22:50:57.186732+09	20250727103610_add_commission_fields	\N	\N	2025-07-31 22:50:57.176449+09	1
\.


--
-- Name: BookingItem BookingItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BookingItem"
    ADD CONSTRAINT "BookingItem_pkey" PRIMARY KEY (id);


--
-- Name: Booking Booking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Hotel Hotel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Hotel"
    ADD CONSTRAINT "Hotel_pkey" PRIMARY KEY (id);


--
-- Name: Inventory Inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Package Package_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Package"
    ADD CONSTRAINT "Package_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Room Room_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Room"
    ADD CONSTRAINT "Room_pkey" PRIMARY KEY (id);


--
-- Name: ShoppingMall ShoppingMall_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShoppingMall"
    ADD CONSTRAINT "ShoppingMall_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Hotel_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Hotel_name_key" ON public."Hotel" USING btree (name);


--
-- Name: Inventory_date_roomId_packageId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Inventory_date_roomId_packageId_key" ON public."Inventory" USING btree (date, "roomId", "packageId");


--
-- Name: ShoppingMall_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ShoppingMall_name_key" ON public."ShoppingMall" USING btree (name);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: BookingItem BookingItem_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BookingItem"
    ADD CONSTRAINT "BookingItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public."Booking"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BookingItem BookingItem_packageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BookingItem"
    ADD CONSTRAINT "BookingItem_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES public."Package"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Booking Booking_roomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES public."Room"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Booking Booking_shoppingMallId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_shoppingMallId_fkey" FOREIGN KEY ("shoppingMallId") REFERENCES public."ShoppingMall"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Booking Booking_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Inventory Inventory_packageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES public."Package"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Inventory Inventory_roomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES public."Room"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Package Package_hotelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Package"
    ADD CONSTRAINT "Package_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES public."Hotel"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Room Room_hotelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Room"
    ADD CONSTRAINT "Room_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES public."Hotel"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

