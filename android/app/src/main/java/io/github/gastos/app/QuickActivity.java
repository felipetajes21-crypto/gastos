package io.github.gastos.app;

import android.content.Intent;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;

/** Janelinha que o widget abre: só a caixa para digitar/falar o gasto. Fecha sozinha ao salvar. */
public class QuickActivity extends WebActivity {
    static final String EXTRA_VOZ = "voz";
    static final String EXTRA_TEXTO = "texto"; // vem do aviso de compra do banco
    static final String EXTRA_AVISO = "aviso"; // id do aviso, para apagar quando abrir

    @Override
    protected String endereco() {
        Intent i = getIntent();
        boolean voz = i != null && i.getBooleanExtra(EXTRA_VOZ, false);
        String texto = i != null ? i.getStringExtra(EXTRA_TEXTO) : null;
        String add = "";
        if (texto != null && !texto.isEmpty()) {
            try { add = "&add=" + java.net.URLEncoder.encode(texto, "UTF-8"); } catch (Exception ignored) { }
        }
        return SITE + "?rapido=1" + (voz ? "&voz=1" : "") + add;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window w = getWindow();
        DisplayMetrics dm = getResources().getDisplayMetrics();
        int altura = Math.round(360 * dm.density);
        w.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, altura);
        w.setGravity(Gravity.BOTTOM);
        w.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_VISIBLE | WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        setFinishOnTouchOutside(true);
        apagarAviso(getIntent());
    }

    private void apagarAviso(Intent i) {
        int id = i != null ? i.getIntExtra(EXTRA_AVISO, 0) : 0;
        if (id != 0) {
            android.app.NotificationManager nm = getSystemService(android.app.NotificationManager.class);
            if (nm != null) nm.cancel(id);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        apagarAviso(intent);
        web.loadUrl(endereco()); // tocou no widget de novo: recomeça limpo
    }

    @Override
    protected void fecharRapido() { finishAndRemoveTask(); }
}
