package io.github.gastos.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONObject;

/** Widget da tela inicial: caixa "Digite o gasto…" + microfone + resumo do mês. */
public class GastosWidget extends AppWidgetProvider {
    private static final String PREFS = "widget";

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) mgr.updateAppWidget(id, montar(ctx));
    }

    /** Chamado pelo site sempre que os dados mudam. */
    static void salvarResumo(Context ctx, String json) {
        SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (json.equals(p.getString("resumo", ""))) return;
        p.edit().putString("resumo", json).apply();
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, GastosWidget.class));
        if (ids.length > 0) {
            RemoteViews v = montar(ctx);
            for (int id : ids) mgr.updateAppWidget(id, v);
        }
    }

    private static RemoteViews montar(Context ctx) {
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget);

        String linha = "";
        try {
            String json = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("resumo", "");
            if (!json.isEmpty()) {
                JSONObject o = new JSONObject(json);
                linha = o.optString("linha", "");
                String sobrou = o.optString("sobrou", "");
                if (!sobrou.isEmpty()) linha += "  ·  " + sobrou;
            }
        } catch (Exception ignored) { }
        if (linha.isEmpty()) v.setTextViewText(R.id.resumo, ctx.getString(R.string.widget_resumo));
        else v.setTextViewText(R.id.resumo, linha);
        v.setViewVisibility(R.id.resumo, View.VISIBLE);

        v.setOnClickPendingIntent(R.id.campo, rapido(ctx, false, 1));
        v.setOnClickPendingIntent(R.id.mic, rapido(ctx, true, 2));

        Intent app = new Intent(ctx, MainActivity.class);
        app.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        v.setOnClickPendingIntent(R.id.resumo, PendingIntent.getActivity(ctx, 3, app,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
        return v;
    }

    private static PendingIntent rapido(Context ctx, boolean voz, int codigo) {
        Intent i = new Intent(ctx, QuickActivity.class);
        i.putExtra(QuickActivity.EXTRA_VOZ, voz);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        return PendingIntent.getActivity(ctx, codigo, i,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
