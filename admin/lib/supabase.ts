import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rhheregmvexxgqmegqoq.supabase.co';
const supabaseAnonKey = 'sb_publishable_qHHfVGUwTIieRw-E2tAsvg_vEqpu2Za';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);