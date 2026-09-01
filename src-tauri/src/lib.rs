use tauri::{
  menu::{Menu, MenuItem},
  tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
  Manager, WindowEvent,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Create System Tray Menu items
      let show_i = MenuItem::with_id(app, "show", "Open WarayFlix", true, None::<&str>)?;
      let hide_i = MenuItem::with_id(app, "hide", "Hide to Tray", true, None::<&str>)?;
      let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

      let menu = Menu::with_items(app, &[&show_i, &hide_i, &quit_i])?;

      let default_icon = app.default_window_icon().cloned();
      if let Some(icon) = default_icon.as_ref() {
        if let Some(window) = app.get_webview_window("main") {
          let _ = window.set_icon(icon.clone());
        }
      }

      // Build System Tray Icon
      let _tray = TrayIconBuilder::new()
        .icon(default_icon.unwrap_or_else(|| tauri::image::Image::new(&[], 0, 0)))
        .menu(&menu)
        .tooltip("WarayFlix — Cinema Streaming")
        .on_menu_event(|app, event| match event.id.as_ref() {
          "show" => {
            if let Some(window) = app.get_webview_window("main") {
              let _ = window.show();
              let _ = window.unminimize();
              let _ = window.set_focus();
            }
          }
          "hide" => {
            if let Some(window) = app.get_webview_window("main") {
              let _ = window.hide();
            }
          }
          "quit" => {
            app.exit(0);
          }
          _ => {}
        })
        .on_tray_icon_event(|tray, event| {
          if let TrayIconEvent::Click {
            button: MouseButton::Left,
            button_state: MouseButtonState::Up,
            ..
          } = event
          {
            let app = tray.app_handle();
            if let Some(window) = app.get_webview_window("main") {
              if let Ok(visible) = window.is_visible() {
                if visible {
                  let _ = window.hide();
                } else {
                  let _ = window.show();
                  let _ = window.unminimize();
                  let _ = window.set_focus();
                }
              }
            }
          }
        })
        .build(app)?;

      Ok(())
    })
    .on_window_event(|window, event| {
      // Intercept window close request to minimize to tray instead of quitting
      if let WindowEvent::CloseRequested { api, .. } = event {
        let _ = window.hide();
        api.prevent_close();
      }
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
