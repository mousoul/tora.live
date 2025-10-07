import json
from typing import Any

import pandas as pd


def is_truthy_flag(val: Any) -> int:
    if pd.isna(val):
        return 0
    s = str(val).strip().lower()
    return 1 if s in {"1", "true", "yes", "y", "是", "置顶", "付费"} else 0


def safe_str(val: Any) -> str:
    if pd.isna(val) or val is None:
        return ""
    s = str(val).strip()
    # Normalize 'nan' like strings
    return "" if s.lower() in {"nan", "none", "null"} else s


def to_song(row: pd.Series, index: int):
    # Support both unnamed/positional columns and named columns
    def col(name_or_idx, default=""):
        if isinstance(name_or_idx, int):
            return row.iloc[name_or_idx] if name_or_idx < len(row) else default
        return row.get(name_or_idx, default)

    song_name = safe_str(col(0)) or safe_str(col("song_name"))
    artist = safe_str(col(1)) or safe_str(col("artist"))
    language = safe_str(col(2)) or safe_str(col("language"))
    remarks = safe_str(col(3)) or safe_str(col("remarks"))
    initial = safe_str(col(4)) or safe_str(col("initial"))
    sticky_top = is_truthy_flag(col(5)) if safe_str(col(5)) != "" else is_truthy_flag(col("sticky_top"))
    paid = is_truthy_flag(col(6)) if safe_str(col(6)) != "" else is_truthy_flag(col("paid"))
    bvid = safe_str(col(7)) or safe_str(col("BVID")) or safe_str(col("bvid"))

    return {
        "index": index,
        "song_name": song_name,
        "artist": artist,
        "language": language,
        "remarks": remarks,
        "initial": initial,
        "sticky_top": sticky_top,
        "paid": paid,
        "BVID": bvid,
    }


def _is_nonempty_cell(val: Any) -> bool:
    if pd.isna(val) or val is None:
        return False
    s = str(val).strip()
    return s != "" and s.lower() not in {"nan", "none", "null"}


def main():
    # Read once; preserve order from the sheet
    df = pd.read_excel("./music.xlsx")

    # Option A (implemented): Filter rows by required song_name (first column fallback)
    name_series = (
        df["song_name"] if "song_name" in df.columns else df.iloc[:, 0]
    )
    mask_required = name_series.map(_is_nonempty_cell)
    df = df[mask_required].copy()

    top, rest = [], []
    for idx, row in df.iterrows():
        song = to_song(row, idx)
        (top if song["sticky_top"] == 1 else rest).append(song)

    # Preserve original order within groups, top first
    song_list = top + rest
    # Reassign sequential indices after filtering for stable front-end keys
    for i, s in enumerate(song_list):
        s["index"] = i

    out_path = "../public/music_list.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(song_list, f, ensure_ascii=False)


if __name__ == "__main__":
    main()
