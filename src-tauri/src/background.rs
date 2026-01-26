// 创建全局隐藏窗口，用来做一些后台任务，如初始化应用等
pub fn create_background_window(app: &tauri::AppHandle) -> Result<(), String> {
    #[allow(unused)]
    let mut builder = tauri::WebviewWindowBuilder::new(
        app,
        "background",
        tauri::WebviewUrl::App("index.html#/background".into()),
    )
    .title("background")
    .inner_size(1.0, 1.0)
    .position(0.0, 0.0)
    .decorations(false)
    .skip_taskbar(true)
    .shadow(false)
    .closable(false)
    .resizable(false)
    .always_on_bottom(true);

    #[cfg(target_os = "windows")]
    {
        builder = builder.visible(false);
    }

    let win = builder.build().map_err(|e| e.to_string())?;

    win.set_ignore_cursor_events(true)
        .map_err(|e| e.to_string())?;

    Ok(())
}
