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

    @Override
    protected String endereco() {
        boolean voz = getIntent() != null && getIntent().getBooleanExtra(EXTRA_VOZ, false);
        return SITE + "?rapido=1" + (voz ? "&voz=1" : "");
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
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        web.loadUrl(endereco()); // tocou no widget de novo: recomeça limpo
    }

    @Override
    protected void fecharRapido() { finishAndRemoveTask(); }
}
