-- ============================================================
-- DESTRUCTIVE: drops all saree-store tables.
-- Run this BEFORE schema.sql if you previously ran an older
-- version (e.g. with uuid IDs or fewer columns) and want to
-- start fresh.
--
-- ⚠️  Wipes products, orders, chat sessions, chat messages.
-- ============================================================

drop table if exists chat_messages cascade;
drop table if exists chat_sessions cascade;
drop table if exists order_items cascade;        -- legacy from older schema
drop table if exists orders cascade;
drop table if exists products cascade;
drop table if exists return_requests cascade;    -- legacy from older schema
drop table if exists profiles cascade;           -- legacy from older schema
