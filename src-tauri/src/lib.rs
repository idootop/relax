mod background;
mod overlay;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                // 设置为任务栏应用（隐藏 Dock 栏窗口图标）
                app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            }
            background::create_background_window(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![overlay::create_overlay_window,])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
