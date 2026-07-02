--
-- PostgreSQL database dump
--

\restrict ZxZ86bwUaX26loYv8VBBQ67s8GdLqSQkuFRv5HeveAT883YzY09jYoFGVyEewrh

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.room_members DROP CONSTRAINT IF EXISTS "FK_ca3c84760fb37c2f14658a0a2ec";
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS "FK_aaa8a6effc7bd20a1172d3a3bc8";
ALTER TABLE IF EXISTS ONLY public.room_members DROP CONSTRAINT IF EXISTS "FK_a27f901523ddfa2eaecb16a5976";
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS "FK_3ddc983c5f7bcf132fd8732c3f4";
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS "FK_2db9cf2b3ca111742793f6c37ce";
DROP INDEX IF EXISTS public."IDX_151cb61c3e462093aa3b8e70f7";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS "UQ_97672ac88f789774dd47f7c8be3";
ALTER TABLE IF EXISTS ONLY public.rooms DROP CONSTRAINT IF EXISTS "UQ_8f569e8b851d66275352ede4bf2";
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS "UQ_4542dd2f38a61354a040ba9fd57";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS "PK_a3ffb1c0c8416b9fc6f907b7433";
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS "PK_7d8bee0204106019488c4c50ffa";
ALTER TABLE IF EXISTS ONLY public.room_members DROP CONSTRAINT IF EXISTS "PK_4493fab0433f741b7cf842e6038";
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS "PK_18325f38ae6de43878487eff986";
ALTER TABLE IF EXISTS ONLY public.rooms DROP CONSTRAINT IF EXISTS "PK_0368a2d7c215f2d0458a54933f2";
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.rooms;
DROP TABLE IF EXISTS public.room_members;
DROP TABLE IF EXISTS public.refresh_tokens;
DROP TABLE IF EXISTS public.messages;
DROP TYPE IF EXISTS public.room_members_role_enum;
DROP EXTENSION IF EXISTS "uuid-ossp";
--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: room_members_role_enum; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public.room_members_role_enum AS ENUM (
    'owner',
    'member'
);


ALTER TYPE public.room_members_role_enum OWNER TO "user";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    content text NOT NULL,
    "senderId" uuid NOT NULL,
    "roomId" uuid NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.messages OWNER TO "user";

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    token character varying NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    user_id uuid NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone
);


ALTER TABLE public.refresh_tokens OWNER TO "user";

--
-- Name: room_members; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.room_members (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    role public.room_members_role_enum DEFAULT 'member'::public.room_members_role_enum NOT NULL,
    "mutedUntil" timestamp without time zone,
    "userId" uuid NOT NULL,
    "roomId" uuid NOT NULL,
    "joinedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.room_members OWNER TO "user";

--
-- Name: rooms; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.rooms (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    "inviteCode" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.rooms OWNER TO "user";

--
-- Name: users; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying NOT NULL,
    username character varying,
    "passwordHash" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO "user";

--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.messages (id, content, "senderId", "roomId", "createdAt") FROM stdin;
9836ce84-f233-4194-892e-163d12c08e26	Non tolero cotidie taceo veritas.	0f6bb587-dbd3-4ef5-9900-d87b016a8e43	2e7c6c11-aef3-47ea-83f1-f9253f3e356f	2026-07-02 13:15:01.541807
24b0f051-bc9b-46e2-b61c-f02ecf5a6970	Unus vivo acer vaco.	0f6bb587-dbd3-4ef5-9900-d87b016a8e43	2e7c6c11-aef3-47ea-83f1-f9253f3e356f	2026-07-02 13:15:01.545179
91d1624e-3cce-41d6-80a8-ff45febfec52	Abundans appono caecus.	e78f0b3d-3a1b-4d3e-9e0f-9b046dfc5dad	2e7c6c11-aef3-47ea-83f1-f9253f3e356f	2026-07-02 13:15:01.552375
21d98276-02cc-4a48-93ee-a237b0aec3f2	Cursim amitto crux pel officia pauci vix caries laboriosam dolor.	e78f0b3d-3a1b-4d3e-9e0f-9b046dfc5dad	2e7c6c11-aef3-47ea-83f1-f9253f3e356f	2026-07-02 13:15:01.555843
9c1bfed5-a37b-4efe-b786-a8aed0cf161e	Verus tamdiu civis amoveo creta delibero tenetur aedificium undique.	ce23ffc1-f7e9-49a1-bae6-9bc83e04e076	2e7c6c11-aef3-47ea-83f1-f9253f3e356f	2026-07-02 13:15:01.560258
83990efd-c235-4ae5-963a-74965f94ca54	Tot careo ipsum carbo dolorum vero decor.	ce23ffc1-f7e9-49a1-bae6-9bc83e04e076	2e7c6c11-aef3-47ea-83f1-f9253f3e356f	2026-07-02 13:15:01.562072
77cf8fc1-5160-4d02-968d-b3fca7bd86db	Vulariter bestia comminor teres cena arceo uberrime ventito tum pel.	ce23ffc1-f7e9-49a1-bae6-9bc83e04e076	2e7c6c11-aef3-47ea-83f1-f9253f3e356f	2026-07-02 13:15:01.5638
827608c5-5529-4710-8b1c-f44f94e889b1	Agnosco cometes beneficium.	ce23ffc1-f7e9-49a1-bae6-9bc83e04e076	2e7c6c11-aef3-47ea-83f1-f9253f3e356f	2026-07-02 13:15:01.565728
3bea2487-9bf2-4147-843b-257971914d5d	Velut ex decerno a.	ce23ffc1-f7e9-49a1-bae6-9bc83e04e076	2e7c6c11-aef3-47ea-83f1-f9253f3e356f	2026-07-02 13:15:01.567853
13e2a373-7bde-481d-a668-8497f1e06290	Aduro deprecator consequatur atque adfectus vetus quam consuasor.	c26592cf-656f-430e-936d-ecf584e61450	2e7c6c11-aef3-47ea-83f1-f9253f3e356f	2026-07-02 13:15:01.572547
fdfc3e85-3e9d-473e-88ab-baa9b4a9c91c	Admiratio ad synagoga ait bibo sonitus sufficio voluptate.	c26592cf-656f-430e-936d-ecf584e61450	2e7c6c11-aef3-47ea-83f1-f9253f3e356f	2026-07-02 13:15:01.575783
e98539be-f47b-4d4f-8a3c-7911b5d680f2	Angulus antepono tolero apparatus dolore cruciamentum itaque vita sapiente.	803bf9f8-dfea-47a2-853a-bfb57c7a29a5	2e7c6c11-aef3-47ea-83f1-f9253f3e356f	2026-07-02 13:15:01.5809
9089a125-7a4a-438e-bac9-d71fba8b12ed	Caelestis bestia thorax nihil ascisco sublime thymum suppellex adsidue.	803bf9f8-dfea-47a2-853a-bfb57c7a29a5	2e7c6c11-aef3-47ea-83f1-f9253f3e356f	2026-07-02 13:15:01.582867
a6d72d8c-083f-4cab-b5bb-1d8b19962859	Thorax vulgo coniuratio tantum aegrotatio deleniti virgo eligendi.	803bf9f8-dfea-47a2-853a-bfb57c7a29a5	2e7c6c11-aef3-47ea-83f1-f9253f3e356f	2026-07-02 13:15:01.584582
fb0bc3ce-501a-4185-a643-2293dcdfa20f	Villa nisi tui aiunt aliquid supra deprimo stipes sonitus.	f1d45fa4-f533-4ba8-93ab-cb7db325e43d	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.588852
a5a7fe39-46ce-4ef7-94c0-d9167c91a3a4	Assumenda ciminatio adiuvo unus velum.	f1d45fa4-f533-4ba8-93ab-cb7db325e43d	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.591179
8786c41f-52ac-45e7-b748-a7aa969d9ddf	Vomito cena termes acsi caelum videlicet deleo traho.	f1d45fa4-f533-4ba8-93ab-cb7db325e43d	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.593678
0c3adc35-14c4-4b69-9f41-a72a7c6338fd	Tenuis laudantium consuasor vulpes socius addo benigne nemo.	ce23ffc1-f7e9-49a1-bae6-9bc83e04e076	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.597739
5fc8e869-6dcc-4908-87b5-14527b43d5f0	Vicissitudo tandem demergo vacuus cupiditate patria tunc alienus.	ce23ffc1-f7e9-49a1-bae6-9bc83e04e076	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.599673
a062162b-3443-4b68-ab79-6d9dc10ccc23	Decor cunabula versus.	ce23ffc1-f7e9-49a1-bae6-9bc83e04e076	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.601353
ff0c4336-f582-4b18-b76f-7aad036c0fc8	Summisse architecto blandior voluptate despecto corrigo abbas toties armarium.	ce23ffc1-f7e9-49a1-bae6-9bc83e04e076	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.603
14a4a995-ed56-4cf8-9a79-4bbe7043b57d	Pauci volup vetus casso pauper amplus caterva molestiae.	0f6bb587-dbd3-4ef5-9900-d87b016a8e43	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.606545
91f49adf-5c7c-4530-bc2d-47fff0731f12	Autus defungo acsi annus suppono tollo vomito solvo adficio.	0f6bb587-dbd3-4ef5-9900-d87b016a8e43	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.608162
d417c40d-2d92-4b25-9b83-b6a2f20a3a0a	Aestivus viduo animi antepono id cetera pariatur aspernatur.	0f6bb587-dbd3-4ef5-9900-d87b016a8e43	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.609813
30a9fdd2-c363-4d04-9b66-ea63f9743e7f	Alter volva tego ventus excepturi animi fugit aptus vita corrumpo.	0f6bb587-dbd3-4ef5-9900-d87b016a8e43	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.611462
4d3a2aa4-1922-4990-81c9-f956c26c96f7	Ager demum delibero toties certus timor nobis arcus.	0f6bb587-dbd3-4ef5-9900-d87b016a8e43	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.613126
b4d8a468-cd3e-4030-b038-b69ad7b49fee	Careo concido officiis voveo optio attero.	c26592cf-656f-430e-936d-ecf584e61450	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.616591
6df2e34b-6105-4a8b-b986-958de05eacee	Comminor rerum atqui viscus soluta sollers.	c26592cf-656f-430e-936d-ecf584e61450	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.618155
694fb2db-2313-4049-8777-e9b310b7f5ef	Angulus utpote caute stella exercitationem decretum virtus teres amissio ancilla.	c26592cf-656f-430e-936d-ecf584e61450	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.619754
3bd4b16e-a58a-4f5b-a20d-8a32eb638cc6	Desparatus delego aperte cilicium labore amo creptio delinquo cubo triumphus.	c26592cf-656f-430e-936d-ecf584e61450	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.621396
ee98387d-9436-4ee1-984d-27a25b9d8142	Consequatur varius atque valde conspergo adfectus vitium.	9d813cad-4705-4299-911b-26f2e123f698	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.624568
2c6201f3-63ce-4da7-a3c1-6311ce9cb0e0	Adiuvo possimus vespillo stips advoco versus chirographum.	9d813cad-4705-4299-911b-26f2e123f698	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.626085
5820c9c8-eecc-45a9-8784-d5c20173ce49	Pecco capio cupiditas.	9d813cad-4705-4299-911b-26f2e123f698	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.627597
43331251-7308-4cad-8308-0497105501ce	Voluptate sursum creptio.	e78f0b3d-3a1b-4d3e-9e0f-9b046dfc5dad	f262d6ca-f33c-4c6d-990a-db5ae0d67707	2026-07-02 13:15:01.631082
307e9ce0-1ccb-4086-a44a-7c856b3772ad	Arcus caput acies comparo eum tergeo canonicus textor comitatus.	e78f0b3d-3a1b-4d3e-9e0f-9b046dfc5dad	f262d6ca-f33c-4c6d-990a-db5ae0d67707	2026-07-02 13:15:01.63285
72891136-68e0-476f-bd97-410ebc451943	Defungo ultra conservo vomer.	e78f0b3d-3a1b-4d3e-9e0f-9b046dfc5dad	f262d6ca-f33c-4c6d-990a-db5ae0d67707	2026-07-02 13:15:01.634749
136be93a-b026-4972-8041-9724deccab44	Ustulo tabesco canonicus nobis torrens.	ce23ffc1-f7e9-49a1-bae6-9bc83e04e076	f262d6ca-f33c-4c6d-990a-db5ae0d67707	2026-07-02 13:15:01.638048
f95bf242-5e2b-460f-a239-b2dbbbf9aa7f	Ullam talus curiositas pecto.	9d813cad-4705-4299-911b-26f2e123f698	f262d6ca-f33c-4c6d-990a-db5ae0d67707	2026-07-02 13:15:01.641351
48f8a04a-b59a-455d-a95c-d6c16f107aea	Coadunatio dens ceno voluptatibus.	9d813cad-4705-4299-911b-26f2e123f698	f262d6ca-f33c-4c6d-990a-db5ae0d67707	2026-07-02 13:15:01.64299
898493a3-8d46-4775-9e4b-d947a26d563a	Suasoria corrumpo cunae.	9d813cad-4705-4299-911b-26f2e123f698	f262d6ca-f33c-4c6d-990a-db5ae0d67707	2026-07-02 13:15:01.644476
c754d6a5-fde1-402a-bf6d-f1799a391ad1	Nesciunt pel blanditiis.	9d813cad-4705-4299-911b-26f2e123f698	f262d6ca-f33c-4c6d-990a-db5ae0d67707	2026-07-02 13:15:01.646089
b7eb3c03-41f2-4e61-b604-61c6fdb71e94	Beatae tempora vulticulus tergeo iste voluptatibus tondeo.	f1d45fa4-f533-4ba8-93ab-cb7db325e43d	f262d6ca-f33c-4c6d-990a-db5ae0d67707	2026-07-02 13:15:01.650025
83141ef2-7591-4355-b400-4c3696a8a32f	Sub crapula delego terminatio tabernus.	f1d45fa4-f533-4ba8-93ab-cb7db325e43d	f262d6ca-f33c-4c6d-990a-db5ae0d67707	2026-07-02 13:15:01.654766
8207c03f-9ead-4fc9-ab03-8c843c1e20c4	Paulatim cunctatio confugo curtus defleo quas quae tollo theologus.	f1d45fa4-f533-4ba8-93ab-cb7db325e43d	f262d6ca-f33c-4c6d-990a-db5ae0d67707	2026-07-02 13:15:01.662433
953f9181-6cac-40eb-becc-da5301061ff6	Accusamus tempore provident coadunatio apparatus clam curtus.	f1d45fa4-f533-4ba8-93ab-cb7db325e43d	f262d6ca-f33c-4c6d-990a-db5ae0d67707	2026-07-02 13:15:01.670947
c0f86cb6-b79a-44d7-88ff-9cd94f8f7c7f	Desipio itaque doloribus audeo ad celer omnis.	f1d45fa4-f533-4ba8-93ab-cb7db325e43d	f262d6ca-f33c-4c6d-990a-db5ae0d67707	2026-07-02 13:15:01.709392
e8d9f8ee-18d3-4bc6-8893-508952647ca1	Suadeo cibo deserunt suggero.	a4c7b4e9-c053-455d-be7c-a7d2969d901c	f262d6ca-f33c-4c6d-990a-db5ae0d67707	2026-07-02 13:15:01.714852
9a4c3e27-9955-4d6d-9c05-f6b6ed317d4f	Aliquid conforto eligendi vomica ter careo atavus neque teres aegrus.	a4c7b4e9-c053-455d-be7c-a7d2969d901c	f262d6ca-f33c-4c6d-990a-db5ae0d67707	2026-07-02 13:15:01.727917
081683df-328f-4434-9f52-b0b37e0d89cb	from me	f1d45fa4-f533-4ba8-93ab-cb7db325e43d	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:34:53.478522
809bc19f-34e3-4143-ba1f-5bf810b3d337	f	c26592cf-656f-430e-936d-ecf584e61450	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 14:15:20.417453
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.refresh_tokens (id, token, "expiresAt", user_id, "createdAt", "updatedAt", "deletedAt") FROM stdin;
8035dc69-8a1e-4d75-a5cf-bab8d4357848	770192308f81c6e622c5a2cddf68d7da85ea38948ed81a44e89df0cfc46ff19277796f24bff9bfaf	2026-07-09 16:34:16.547	f1d45fa4-f533-4ba8-93ab-cb7db325e43d	2026-07-02 13:34:16.547126	2026-07-02 13:34:16.547126	\N
d48c4c74-4cba-4d98-852f-ac34ad3d5e41	90e4d5821c611428d7aa9b33317471081ba9e45ef88a2dcd21f99b53e2301ec4466f3ac8ee142451	2026-07-09 16:34:42.093	f1d45fa4-f533-4ba8-93ab-cb7db325e43d	2026-07-02 13:34:42.092067	2026-07-02 13:34:42.092067	\N
c755c36b-459d-476d-9b2a-83217544c732	5c91210046d064983111d18fa5becc261ea5fecfee442a6b0c5883626967193c57f85d3727e32022	2026-07-09 16:35:19.994	803bf9f8-dfea-47a2-853a-bfb57c7a29a5	2026-07-02 13:35:19.993159	2026-07-02 13:35:19.993159	\N
bfee9e31-d46d-464e-90f8-659ca9a16401	d1dd40e51f7d8c4e889bca119c87f8f96e3d9feb2370c090a51b77df9023c0ba7ffc2acb156508e2	2026-07-09 16:36:19.977	c26592cf-656f-430e-936d-ecf584e61450	2026-07-02 13:36:19.976248	2026-07-02 13:36:19.976248	\N
3e79ce99-55fc-47fe-afb9-84602b5bb5ec	9bb4beff85605fbbcaa6859821b6c8ccbe71e54307ded19f3f32b4ba8d3b33b7c76a64d9e2b1d14c	2026-07-09 16:38:37.187	d4e0045a-98ac-4af6-b1f6-fe8d0c5bdddd	2026-07-02 13:38:37.186125	2026-07-02 13:38:37.186125	\N
be02ac68-1830-4f2c-97bf-b24a8b13504f	4f40792a3ea7822e8907a8ab65e62a7154b91a20d0858072c9fe2f6c69f8a584c4cd7b66a085244d	2026-07-09 17:10:21.482	f1d45fa4-f533-4ba8-93ab-cb7db325e43d	2026-07-02 14:10:21.483187	2026-07-02 14:10:21.483187	\N
b26211b1-f553-47ef-b97d-43e26a1e3dfd	2e7655499fef7c0c7b3f8f45d08167de1f9fb1138cfdaf0b77e8f7c72905804fc60466446f5636ec	2026-07-09 17:10:44.236	c26592cf-656f-430e-936d-ecf584e61450	2026-07-02 14:10:44.235115	2026-07-02 14:10:44.235115	\N
\.


--
-- Data for Name: room_members; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.room_members (id, role, "mutedUntil", "userId", "roomId", "joinedAt") FROM stdin;
fa13c503-0c53-4e19-a27c-190b6cb48296	owner	\N	0f6bb587-dbd3-4ef5-9900-d87b016a8e43	2e7c6c11-aef3-47ea-83f1-f9253f3e356f	2026-07-02 13:15:01.537103
1c297eba-29ae-4f32-8bde-8ade73f3b649	member	\N	e78f0b3d-3a1b-4d3e-9e0f-9b046dfc5dad	2e7c6c11-aef3-47ea-83f1-f9253f3e356f	2026-07-02 13:15:01.549276
d9d7d559-41b9-443e-a951-1eb9093004b2	member	\N	ce23ffc1-f7e9-49a1-bae6-9bc83e04e076	2e7c6c11-aef3-47ea-83f1-f9253f3e356f	2026-07-02 13:15:01.55838
a99997fb-c010-4222-8dfe-18a5b8dc5a92	member	\N	c26592cf-656f-430e-936d-ecf584e61450	2e7c6c11-aef3-47ea-83f1-f9253f3e356f	2026-07-02 13:15:01.569972
78317546-5bfa-4c9a-bd57-dff4c013815f	member	\N	803bf9f8-dfea-47a2-853a-bfb57c7a29a5	2e7c6c11-aef3-47ea-83f1-f9253f3e356f	2026-07-02 13:15:01.578697
82e543e2-bfc8-497d-9b92-5c6fff74b612	owner	\N	f1d45fa4-f533-4ba8-93ab-cb7db325e43d	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.586518
34987e95-aef1-4ce6-93b1-caecf1c5dbf3	member	\N	ce23ffc1-f7e9-49a1-bae6-9bc83e04e076	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.595958
c8418264-5135-4b00-878c-cf4c185ee9c8	member	\N	0f6bb587-dbd3-4ef5-9900-d87b016a8e43	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.604781
8304c106-7c53-4b86-8578-10fbe50935ec	owner	\N	e78f0b3d-3a1b-4d3e-9e0f-9b046dfc5dad	f262d6ca-f33c-4c6d-990a-db5ae0d67707	2026-07-02 13:15:01.62914
3615cd06-9546-490d-a7ed-9d98eac45643	member	\N	ce23ffc1-f7e9-49a1-bae6-9bc83e04e076	f262d6ca-f33c-4c6d-990a-db5ae0d67707	2026-07-02 13:15:01.636377
77e6830e-1017-4dca-9eff-27fe761808ff	member	\N	9d813cad-4705-4299-911b-26f2e123f698	f262d6ca-f33c-4c6d-990a-db5ae0d67707	2026-07-02 13:15:01.639823
a4749eae-ea8e-4595-b7dc-84bb62935c95	member	\N	f1d45fa4-f533-4ba8-93ab-cb7db325e43d	f262d6ca-f33c-4c6d-990a-db5ae0d67707	2026-07-02 13:15:01.64782
76da77a5-a57d-4d73-be71-c4da3b81c886	member	\N	a4c7b4e9-c053-455d-be7c-a7d2969d901c	f262d6ca-f33c-4c6d-990a-db5ae0d67707	2026-07-02 13:15:01.711984
d891b707-8772-4d5e-b124-52ecd6e7f8a3	member	\N	d4e0045a-98ac-4af6-b1f6-fe8d0c5bdddd	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:38:48.549651
e93ba31e-1926-46ec-894a-499fe78dbdb4	owner	\N	f1d45fa4-f533-4ba8-93ab-cb7db325e43d	a87b3f8e-186e-4170-90b8-91e0e6f200ae	2026-07-02 13:39:09.570378
f448a574-f9b7-4bbf-90f7-5f97372be307	member	\N	c26592cf-656f-430e-936d-ecf584e61450	668f35b2-649d-4ec6-8922-78ff9ccc3d20	2026-07-02 13:15:01.6147
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.rooms (id, title, "inviteCode", "createdAt", "updatedAt") FROM stdin;
2e7c6c11-aef3-47ea-83f1-f9253f3e356f	spoliatio summopere Chat	76C7DF8C	2026-07-02 13:15:01.529385	2026-07-02 13:15:01.529385
668f35b2-649d-4ec6-8922-78ff9ccc3d20	tantillus deprimo Chat	82919A9A	2026-07-02 13:15:01.532893	2026-07-02 13:15:01.532893
f262d6ca-f33c-4c6d-990a-db5ae0d67707	thesaurus similique Chat	F29DAD5C	2026-07-02 13:15:01.534756	2026-07-02 13:15:01.534756
a87b3f8e-186e-4170-90b8-91e0e6f200ae	MY Room	9FB98A37	2026-07-02 13:39:09.560032	2026-07-02 13:39:09.560032
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.users (id, email, username, "passwordHash", "createdAt", "updatedAt") FROM stdin;
f1d45fa4-f533-4ba8-93ab-cb7db325e43d	user1@example.com	user1	$2b$10$nLNpJ.ViHLaNu.vZ1QJJRucWEtlN3UFxMT2FY7prQ8cnmae8tLkgi	2026-07-02 13:15:01.495359	2026-07-02 13:15:01.495359
c26592cf-656f-430e-936d-ecf584e61450	user2@example.com	user2	$2b$10$nLNpJ.ViHLaNu.vZ1QJJRucWEtlN3UFxMT2FY7prQ8cnmae8tLkgi	2026-07-02 13:15:01.506216	2026-07-02 13:15:01.506216
803bf9f8-dfea-47a2-853a-bfb57c7a29a5	user3@example.com	user3	$2b$10$nLNpJ.ViHLaNu.vZ1QJJRucWEtlN3UFxMT2FY7prQ8cnmae8tLkgi	2026-07-02 13:15:01.508898	2026-07-02 13:15:01.508898
e78f0b3d-3a1b-4d3e-9e0f-9b046dfc5dad	user4@example.com	user4	$2b$10$nLNpJ.ViHLaNu.vZ1QJJRucWEtlN3UFxMT2FY7prQ8cnmae8tLkgi	2026-07-02 13:15:01.511714	2026-07-02 13:15:01.511714
413425f1-ffdd-4d9e-8a86-58a9b9cd331c	user5@example.com	user5	$2b$10$nLNpJ.ViHLaNu.vZ1QJJRucWEtlN3UFxMT2FY7prQ8cnmae8tLkgi	2026-07-02 13:15:01.513785	2026-07-02 13:15:01.513785
a4c7b4e9-c053-455d-be7c-a7d2969d901c	user6@example.com	user6	$2b$10$nLNpJ.ViHLaNu.vZ1QJJRucWEtlN3UFxMT2FY7prQ8cnmae8tLkgi	2026-07-02 13:15:01.516002	2026-07-02 13:15:01.516002
0f6bb587-dbd3-4ef5-9900-d87b016a8e43	user7@example.com	user7	$2b$10$nLNpJ.ViHLaNu.vZ1QJJRucWEtlN3UFxMT2FY7prQ8cnmae8tLkgi	2026-07-02 13:15:01.51795	2026-07-02 13:15:01.51795
ce23ffc1-f7e9-49a1-bae6-9bc83e04e076	user8@example.com	user8	$2b$10$nLNpJ.ViHLaNu.vZ1QJJRucWEtlN3UFxMT2FY7prQ8cnmae8tLkgi	2026-07-02 13:15:01.519667	2026-07-02 13:15:01.519667
7ccd8db4-2b96-4145-99fe-e3e9153cba7a	user9@example.com	user9	$2b$10$nLNpJ.ViHLaNu.vZ1QJJRucWEtlN3UFxMT2FY7prQ8cnmae8tLkgi	2026-07-02 13:15:01.522421	2026-07-02 13:15:01.522421
9d813cad-4705-4299-911b-26f2e123f698	user10@example.com	user10	$2b$10$nLNpJ.ViHLaNu.vZ1QJJRucWEtlN3UFxMT2FY7prQ8cnmae8tLkgi	2026-07-02 13:15:01.526602	2026-07-02 13:15:01.526602
d4e0045a-98ac-4af6-b1f6-fe8d0c5bdddd	user100@gmail.com	user100	$2b$10$47Wl.es533buvkNDClnyFu2itEYIdgB01bzL9NhSS4taogao5G6rm	2026-07-02 13:38:37.178441	2026-07-02 13:38:37.178441
\.


--
-- Name: rooms PK_0368a2d7c215f2d0458a54933f2; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY (id);


--
-- Name: messages PK_18325f38ae6de43878487eff986; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY (id);


--
-- Name: room_members PK_4493fab0433f741b7cf842e6038; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.room_members
    ADD CONSTRAINT "PK_4493fab0433f741b7cf842e6038" PRIMARY KEY (id);


--
-- Name: refresh_tokens PK_7d8bee0204106019488c4c50ffa; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: refresh_tokens UQ_4542dd2f38a61354a040ba9fd57; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57" UNIQUE (token);


--
-- Name: rooms UQ_8f569e8b851d66275352ede4bf2; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT "UQ_8f569e8b851d66275352ede4bf2" UNIQUE ("inviteCode");


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: IDX_151cb61c3e462093aa3b8e70f7; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "IDX_151cb61c3e462093aa3b8e70f7" ON public.room_members USING btree ("userId", "roomId");


--
-- Name: messages FK_2db9cf2b3ca111742793f6c37ce; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce" FOREIGN KEY ("senderId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens FK_3ddc983c5f7bcf132fd8732c3f4; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: room_members FK_a27f901523ddfa2eaecb16a5976; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.room_members
    ADD CONSTRAINT "FK_a27f901523ddfa2eaecb16a5976" FOREIGN KEY ("roomId") REFERENCES public.rooms(id) ON DELETE CASCADE;


--
-- Name: messages FK_aaa8a6effc7bd20a1172d3a3bc8; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "FK_aaa8a6effc7bd20a1172d3a3bc8" FOREIGN KEY ("roomId") REFERENCES public.rooms(id) ON DELETE CASCADE;


--
-- Name: room_members FK_ca3c84760fb37c2f14658a0a2ec; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.room_members
    ADD CONSTRAINT "FK_ca3c84760fb37c2f14658a0a2ec" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ZxZ86bwUaX26loYv8VBBQ67s8GdLqSQkuFRv5HeveAT883YzY09jYoFGVyEewrh

