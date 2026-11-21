package io.github.gastos.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

/** Widget da tela inicial: só a caixa "Digite o gasto…" e o microfone, sem fundo. */
public class GastosWidget extends AppWidgetProvider {
    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) mgr.updateAppWidget(id, montar(ctx));
    }

    /** O site manda o resumo do mês, mas o widget agora mostra só a caixa: nada a fazer. */
    static void salvarResumo(Context ctx, String json) { }

    private static RemoteViews montar(Context ctx) {
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget);

        v.setOnClickPendingIntent(R.id.campo, rapido(ctx, false, 1));
        v.setOnClickPendingIntent(R.id.mic, rapido(ctx, true, 2));

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
