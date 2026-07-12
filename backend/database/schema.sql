--
-- PostgreSQL database dump
--

\restrict qPD4J9jUQIYwhIF3fMeIoRrUjBKJGybHQpYh62DIigshEyPbyf0DV4DkOo0Xzhl

-- Dumped from database version 16.12
-- Dumped by pg_dump version 16.12

-- Started on 2026-07-12 14:23:29

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 16408)
-- Name: drivers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drivers (
    driver_id integer NOT NULL,
    name character varying(100) NOT NULL,
    license_number character varying(30) NOT NULL,
    license_expiry date NOT NULL,
    phone character varying(15) NOT NULL,
    status character varying(20) NOT NULL
);


ALTER TABLE public.drivers OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16407)
-- Name: drivers_driver_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.drivers ALTER COLUMN driver_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.drivers_driver_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 224 (class 1259 OID 16443)
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    expense_id integer NOT NULL,
    vehicle_id integer NOT NULL,
    expense_type character varying(50) NOT NULL,
    amount integer NOT NULL,
    expense_date date NOT NULL,
    remarks character varying(255)
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16442)
-- Name: expenses_expense_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.expenses ALTER COLUMN expense_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.expenses_expense_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 222 (class 1259 OID 16432)
-- Name: maintenance_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_logs (
    maintenance_id integer NOT NULL,
    vehicle_id integer NOT NULL,
    service_date date NOT NULL,
    service_type character varying(100) NOT NULL,
    cost integer NOT NULL,
    status character varying(20) NOT NULL
);


ALTER TABLE public.maintenance_logs OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16431)
-- Name: maintenance_logs_maintenance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.maintenance_logs ALTER COLUMN maintenance_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.maintenance_logs_maintenance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 16416)
-- Name: trips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trips (
    trip_id integer NOT NULL,
    vehicle_id integer NOT NULL,
    driver_id integer NOT NULL,
    source character varying(100) NOT NULL,
    destination character varying(100) NOT NULL,
    cargo_weight integer NOT NULL,
    distance integer NOT NULL,
    status character varying(20) NOT NULL
);


ALTER TABLE public.trips OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16415)
-- Name: trips_trip_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.trips ALTER COLUMN trip_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.trips_trip_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 216 (class 1259 OID 16400)
-- Name: vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicles (
    vehicle_id integer NOT NULL,
    registration_number character varying(20) NOT NULL,
    vehicle_name character varying(100) NOT NULL,
    vehicle_type character varying(50) NOT NULL,
    max_load_capacity integer NOT NULL,
    status character varying(20) NOT NULL
);


ALTER TABLE public.vehicles OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16399)
-- Name: vehicles_vehicle_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.vehicles ALTER COLUMN vehicle_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.vehicles_vehicle_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 4919 (class 0 OID 16408)
-- Dependencies: 218
-- Data for Name: drivers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drivers (driver_id, name, license_number, license_expiry, phone, status) FROM stdin;
\.


--
-- TOC entry 4925 (class 0 OID 16443)
-- Dependencies: 224
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (expense_id, vehicle_id, expense_type, amount, expense_date, remarks) FROM stdin;
\.


--
-- TOC entry 4923 (class 0 OID 16432)
-- Dependencies: 222
-- Data for Name: maintenance_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_logs (maintenance_id, vehicle_id, service_date, service_type, cost, status) FROM stdin;
\.


--
-- TOC entry 4921 (class 0 OID 16416)
-- Dependencies: 220
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trips (trip_id, vehicle_id, driver_id, source, destination, cargo_weight, distance, status) FROM stdin;
\.


--
-- TOC entry 4917 (class 0 OID 16400)
-- Dependencies: 216
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicles (vehicle_id, registration_number, vehicle_name, vehicle_type, max_load_capacity, status) FROM stdin;
\.


--
-- TOC entry 4931 (class 0 OID 0)
-- Dependencies: 217
-- Name: drivers_driver_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drivers_driver_id_seq', 1, false);


--
-- TOC entry 4932 (class 0 OID 0)
-- Dependencies: 223
-- Name: expenses_expense_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expenses_expense_id_seq', 1, false);


--
-- TOC entry 4933 (class 0 OID 0)
-- Dependencies: 221
-- Name: maintenance_logs_maintenance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenance_logs_maintenance_id_seq', 1, false);


--
-- TOC entry 4934 (class 0 OID 0)
-- Dependencies: 219
-- Name: trips_trip_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trips_trip_id_seq', 1, false);


--
-- TOC entry 4935 (class 0 OID 0)
-- Dependencies: 215
-- Name: vehicles_vehicle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicles_vehicle_id_seq', 1, false);


--
-- TOC entry 4760 (class 2606 OID 16412)
-- Name: drivers drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (driver_id);


--
-- TOC entry 4768 (class 2606 OID 16447)
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (expense_id);


--
-- TOC entry 4766 (class 2606 OID 16436)
-- Name: maintenance_logs maintenance_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_logs
    ADD CONSTRAINT maintenance_logs_pkey PRIMARY KEY (maintenance_id);


--
-- TOC entry 4764 (class 2606 OID 16420)
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (trip_id);


--
-- TOC entry 4762 (class 2606 OID 16414)
-- Name: drivers unique_license_number; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT unique_license_number UNIQUE (license_number);


--
-- TOC entry 4756 (class 2606 OID 16406)
-- Name: vehicles unique_registration_number; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT unique_registration_number UNIQUE (registration_number);


--
-- TOC entry 4758 (class 2606 OID 16404)
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (vehicle_id);


--
-- TOC entry 4772 (class 2606 OID 16448)
-- Name: expenses fk_expense_vehicle; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT fk_expense_vehicle FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(vehicle_id);


--
-- TOC entry 4771 (class 2606 OID 16437)
-- Name: maintenance_logs fk_maintenance_vehicle; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_logs
    ADD CONSTRAINT fk_maintenance_vehicle FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(vehicle_id);


--
-- TOC entry 4769 (class 2606 OID 16426)
-- Name: trips fk_trip_driver; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT fk_trip_driver FOREIGN KEY (driver_id) REFERENCES public.drivers(driver_id);


--
-- TOC entry 4770 (class 2606 OID 16421)
-- Name: trips fk_trip_vehicle; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT fk_trip_vehicle FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(vehicle_id);


-- Completed on 2026-07-12 14:23:29

--
-- PostgreSQL database dump complete
--

\unrestrict qPD4J9jUQIYwhIF3fMeIoRrUjBKJGybHQpYh62DIigshEyPbyf0DV4DkOo0Xzhl

