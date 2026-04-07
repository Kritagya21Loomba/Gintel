export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const getSupabase = () => {
    if (!supabaseUrl || !supabaseServiceKey) return null;
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
    });
};

export async function GET() {
    const supabase = getSupabase();
    if (!supabase) {
        return NextResponse.json({
            developersAnalyzed: 0,
            reposScanned: 0,
            cvInsightsGenerated: 0,
            lastUpdated: new Date().toISOString(),
        });
    }

    try {
        const { data, error } = await supabase
            .from("platform_metrics")
            .select("*")
            .eq("id", 1)
            .single();

        if (error) throw error;

        return NextResponse.json({
            developersAnalyzed: data.developers_analyzed,
            reposScanned: data.repos_scanned,
            cvInsightsGenerated: data.cvs_analyzed,
            lastUpdated: new Date().toISOString(),
        });
    } catch (err: any) {
        console.error("Supabase GET error:", err);
        return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const supabase = getSupabase();
    if (!supabase) {
        return NextResponse.json({ ok: false, message: "No Supabase config" }, { status: 400 });
    }

    try {
        const { type, amount } = await req.json();

        if (type === "developer") {
            const { error } = await supabase.rpc('increment_metric', { metric_name: 'developer', amount });
            if (error) throw error;
        } else if (type === "repos" && amount > 0) {
            const { error } = await supabase.rpc('increment_metric', { metric_name: 'repos', amount });
            if (error) throw error;
        } else if (type === "cv") {
            const { error } = await supabase.rpc('increment_metric', { metric_name: 'cv', amount: 1 });
            if (error) throw error;
        }

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("Supabase POST error:", err);
        return NextResponse.json({ error: "Failed to update metrics" }, { status: 500 });
    }
}
