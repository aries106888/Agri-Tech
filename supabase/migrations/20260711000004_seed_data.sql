-- ShambaPoint — Seed Data
-- Migration: 20260711000004_seed_data.sql
-- Demo listings and support categories for local development / testing.

-- ──────────────────────────────────────────────────────────────
-- Insert demo products (farmer_id is NULL for demo; replace with real UUIDs in production)
-- These are visible to the anonymous Data API (status = 'available')
-- ──────────────────────────────────────────────────────────────

-- We can only seed products if a farmer profile exists.
-- In production, farmers sign up and their products are inserted via the app.
-- This seed creates a placeholder demo row that can be removed later.

-- Demo support ticket categories (no table for this; they are just application-level constants)
-- Documented here for reference:
-- 'Farmer Support', 'Buyer Support', 'Logistics Support', 'Admin Support', 'General Inquiry'

-- Placeholder: once you have real auth users, run this to confirm the trigger works:
-- select id, name, role from public.profiles limit 10;
