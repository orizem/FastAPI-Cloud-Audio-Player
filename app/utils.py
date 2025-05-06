def update_home_page(res: dict, audio_files: list):
    res.update(
        {"audio_files": [{"id": row[0], "filename": row[1]} for row in audio_files]}
    )
    return res


def update_logs_page(res: dict, audio_files: list):
    res.update(
        {
            "audio_files": [
                {
                    "id": row[0],
                    "filename": row[1],
                    "verified": row[2],
                    "audio_file_id": row[3],
                    "action": row[4],
                    "column_changed": row[5],
                    "timestamp": row[6],
                }
                for row in audio_files
            ]
        }
    )
    return res


def get_page_tab_params(page_tab: int, verified: str, tag_list: list):
    res = {
        "logs_params": "",
        "where_clause": "",
        "where_clauses": [],
        "params": [],
        "subtitle_conds": [],
        "subtitle_params": [],
        "table_name": "audio_files",
        "joined_subtitle_conds": "",
    }

    if page_tab == 0:
        res["where_clauses"].append("verified = ?")
        res["params"].append(verified)
        res["subtitle_conds"] = ["subtitles LIKE ?" for _ in tag_list]
        res["subtitle_params"] = [f"%{tag}%" for tag in tag_list]

        # subtitles must match all tags (AND)
        res["joined_subtitle_conds"] = " AND ".join(res["subtitle_conds"]) + " OR "
    elif page_tab == 1:
        res["table_name"] = (
            "audio_files_history JOIN audio_files ON audio_files.id = audio_files_history.audio_file_id"
        )
        res["logs_params"] = (
            ", verified, audio_file_id, action, column_changed, timestamp"
        )
    else:
        res["where_clauses"].append("verified = ?")
        res["params"].append(verified)
        res["subtitle_conds"] = ["subtitles LIKE ?" for _ in tag_list]
        res["subtitle_params"] = [f"%{tag}%" for tag in tag_list]

        # subtitles must match all tags (AND)
        res["joined_subtitle_conds"] = " AND ".join(res["subtitle_conds"]) + " OR "

    return res
