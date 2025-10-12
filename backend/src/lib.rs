use extism_pdk::*;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct ExecInput {
    action: String,
    payload: serde_json::Value,
    ctx: serde_json::Value,
}

#[derive(Serialize, Default)]
struct ExecOutput {
    ok: bool,
    data: Option<serde_json::Value>,
    effects: Vec<serde_json::Value>,
    error: Option<serde_json::Value>,
}

#[plugin_fn]
pub fn exec(input: Json<ExecInput>) -> FnResult<Json<ExecOutput>> {
    let inx = input.0;
    let mut out = ExecOutput {
        ok: false,
        ..Default::default()
    };
    match inx.action.as_str() {
        "scrap.hello" => {
            out.ok = true;
            out.effects.push(serde_json::json!({"type":"showToast","level":"success","message":"Hello from Scrap plugin!"}));
        }
        "scrap.create" => {
            let title = inx
                .payload
                .get("title")
                .and_then(|v| v.as_str())
                .unwrap_or("Scrap");
            let first = inx
                .payload
                .get("firstPost")
                .and_then(|v| v.get("content"))
                .and_then(|v| v.as_str());
            out.ok = true;
            out.effects.push(
                serde_json::json!({"type":"createDocument","title":title,"docType":"document"}),
            );
            out.effects.push(serde_json::json!({"type":"putKv","scope":"doc","key":"meta","value":{"isScrap":true}}));
            if let Some(content) = first {
                out.effects.push(serde_json::json!({"type":"createRecord","scope":"doc","kind":"post","data":{"content":content,"pinned":false}}));
            }
            out.effects
                .push(serde_json::json!({"type":"navigate","to":"/scrap/:createdDocId"}));
        }
        "scrap.create_record" => {
            let doc_id = inx
                .payload
                .get("docId")
                .and_then(|v| v.as_str())
                .unwrap_or("");
            let kind = inx
                .payload
                .get("kind")
                .and_then(|v| v.as_str())
                .unwrap_or("");
            let data = inx
                .payload
                .get("data")
                .cloned()
                .unwrap_or(serde_json::json!({}));
            if doc_id.is_empty() || kind.is_empty() {
                out.ok = false;
                out.error = Some(serde_json::json!({"code":"BAD_REQUEST"}));
            } else {
                out.ok = true;
                out.effects.push(serde_json::json!({"type":"createRecord","scope":"doc","docId":doc_id,"kind":kind,"data":data}));
            }
        }
        "scrap.update_record" => {
            let id = inx.payload.get("id").and_then(|v| v.as_str()).unwrap_or("");
            let patch = inx
                .payload
                .get("patch")
                .cloned()
                .unwrap_or(serde_json::json!({}));
            if id.is_empty() {
                out.ok = false;
                out.error = Some(serde_json::json!({"code":"BAD_REQUEST"}));
            } else {
                out.ok = true;
                out.effects
                    .push(serde_json::json!({"type":"updateRecord","recordId":id,"patch":patch}));
            }
        }
        "scrap.delete_record" => {
            let id = inx.payload.get("id").and_then(|v| v.as_str()).unwrap_or("");
            if id.is_empty() {
                out.ok = false;
                out.error = Some(serde_json::json!({"code":"BAD_REQUEST"}));
            } else {
                out.ok = true;
                out.effects
                    .push(serde_json::json!({"type":"deleteRecord","recordId":id}));
            }
        }
        _ => {
            out.ok = false;
            out.error = Some(serde_json::json!({"code":"UNKNOWN_ACTION"}));
        }
    }
    Ok(Json(out))
}
