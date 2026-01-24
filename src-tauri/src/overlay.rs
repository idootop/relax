#[tauri::command]
pub async fn create_overlay_window(
    app: tauri::AppHandle,
    label: String,
    url: String,
    x: i32,
    y: i32,
    width: u32,
    height: u32,
) -> Result<(), String> {
    // 异步构建窗口（避免 Windows 主线程阻塞）
    let builder =
        tauri::WebviewWindowBuilder::new(&app, &label, tauri::WebviewUrl::App(url.into()))
            .title("Overlay")
            .decorations(false)
            .skip_taskbar(true)
            .shadow(false)
            .focused(false)
            .always_on_top(true);

    let window = builder
        .build()
        .map_err(|e| format!("窗口创建失败: {}", e))?;

    #[cfg(target_os = "macos")]
    {
        use objc2_app_kit::{NSScreenSaverWindowLevel, NSWindow, NSWindowCollectionBehavior};

        // 克隆窗口和 app 句柄，用于主线程闭包
        let window_clone = window.clone();
        let app_clone = app.clone();

        // 调度到 macOS 主线程执行 NSWindow 操作
        app_clone
            .run_on_main_thread(move || {
                let ns_window_ptr = window_clone.ns_window().unwrap();
                let ns_window = unsafe { &*(ns_window_ptr as *const NSWindow) };

                ns_window.setLevel(NSScreenSaverWindowLevel);

                let behavior = ns_window.collectionBehavior();
                ns_window.setCollectionBehavior(
                    behavior
                        | NSWindowCollectionBehavior::CanJoinAllSpaces // 所有虚拟桌面可见
                        | NSWindowCollectionBehavior::Stationary // 虚拟桌面切换不移动
                        | NSWindowCollectionBehavior::IgnoresCycle // 忽略 Tab 切换
                        | NSWindowCollectionBehavior::FullScreenAuxiliary, // 适配全屏模式
                );
            })
            .map_err(|e| format!("macOS 主线程执行窗口配置失败: {}", e))?;
    }

    // 设置窗口位置和大小
    window
        .set_position(tauri::PhysicalPosition::new(x, y))
        .map_err(|e| format!("设置窗口位置失败: {}", e))?;
    window
        .set_size(tauri::PhysicalSize::new(width, height))
        .map_err(|e| format!("设置窗口大小失败: {}", e))?;

    // 显示窗口
    window.show().map_err(|e| format!("显示窗口失败: {}", e))?;

    Ok(())
}
