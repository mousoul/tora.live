import React, { useEffect, useRef, useState } from 'react'

import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

import styles from '../styles/Home.module.css'
import 'react-toastify/dist/ReactToastify.css'

import { Button, Col, Container, Offcanvas, Row, Table } from 'react-bootstrap'
import { toast } from 'react-toastify'
import copy from 'copy-to-clipboard'

import MusicList from '../public/music_list.json'

import Banner from '../components/banner/Banner.component'
import BannerMobile from '../components/banner/BannerMobile.component'
import SongDetail from '../components/SongDetail.component'
import BiliPlayerModal from '../components/BiliPlayerModal.component'
import SongListFilter from '../components/SongListFilter.component'

import imageLoader from '../utils/ImageLoader'
import * as utils from '../utils/utils'
import { config } from '../config/constants'


export default function Home() {
  //状态保存: 类别选择, 搜索框, 回到顶部按钮, 移动端自我介绍, 试听窗口
  const [categorySelection, setCategorySelection] = useState({
    lang: "",
    initial: "",
    paid: false,
    remark: "",
  });
  const [searchTags, setSearchTags] = useState([]);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [showToTopButton, setToTopShowButton] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [modalPlayerShow, setPlayerModalShow] = useState(false);
  const [modalPlayerSongName, setPlayerModalSongName] = useState("");
  const [BVID, setBVID] = useState("");
  const [sortKey, setSortKey] = useState(null); // 'title', 'artist', etc.
  const [sortDirection, setSortDirection] = useState('asc');
  const searchInputRef = useRef(null);

  useEffect(() => {
    //检测窗口滚动
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 600) {
        setToTopShowButton(true);
      } else {
        setToTopShowButton(false);
      }
    });
  }, []);

  const handleSort = (key) => {
    if (sortKey === key) {
      // 同一个字段则切换排序方向
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc'); // 新字段从升序开始
    }
  };

  //根据首字母和搜索框进行过滤
  const filteredSongList = MusicList.filter(
    (song) => {
      const searchableFields = [song.song_name, song.language, song.remarks, song.artist];
      const matchesFreeText = searchInputValue.trim() === ""
        ? true
        : searchableFields.some((field) => utils.include(field, searchInputValue));
      const matchesTags = searchTags.length === 0
        ? true
        : searchTags.every((tag) =>
            searchableFields.some((field) => utils.include(field, tag))
          );

      return (
        matchesFreeText &&
        matchesTags &&
        //语言过滤按钮
        (categorySelection.lang != ""
          ? song.language?.includes(categorySelection.lang)
          : true) &&
        //首字母过滤按钮
        (categorySelection.initial != ""
          ? song.initial?.includes(categorySelection.initial)
          : true) &&
        //类型过滤按钮
        (categorySelection.remark != ""
          ? song.remarks?.toLowerCase().includes(categorySelection.remark)
          : true) &&
        //付费过滤按钮
        (categorySelection.paid ? song.paid == 1 : true)
      );
    }
  );

  const collator = new Intl.Collator(['zh', 'ja', 'en'], {
    sensitivity: 'base',
    ignorePunctuation: true,
    numeric: true,
  });
  
  const sortedList = [...filteredSongList].sort((a, b) => {
    if (!sortKey) return 0;
  
    const aValue = (a[sortKey] || '').toString().trim();
    const bValue = (b[sortKey] || '').toString().trim();
  
    return (sortDirection === 'asc'
      ? collator.compare(aValue, bValue)
      : collator.compare(bValue, aValue));
  });
  

  //处理用户复制行为
  const handleClickToCopy = (song) => {
    if (song.paid == 1) {
      copy("点歌 ￥" + song.song_name);
      toast.success(`付费曲目 ${song.song_name} 成功复制到剪贴板!`);
    } else {
      copy("点歌 " + song.song_name);
      toast.success(`${song.song_name} 成功复制到剪贴板!`);
    }
  };

  //改变语言过滤状态
  const setLanguageState = (lang) => {
    setCategorySelection({ lang: lang, initial: "", paid: false, remark: "" });
  };

  //改变首字母过滤状态
  const setInitialState = (initial) => {
    setCategorySelection({
      lang: "国语",
      initial: initial,
      paid: false,
      remark: "",
    });
  };

  //改变备注过滤状态
  const setRemarkState = (remark) => {
    setCategorySelection({
      lang: "",
      initial: "",
      paid: false,
      remark: remark,
    });
  };

  //改变收费过滤状态
  const setPaidState = (paid) => {
    setCategorySelection({ lang: "", initial: "", paid: paid, remark: "" });
  };

  //随便听听
  const handleRandomSong = () => {
    let random = Math.floor(1 + Math.random() * MusicList.length);
    handleClickToCopy(MusicList[random])
  };

  //移动端自我介绍off canvas开关
  const handleCloseIntro = () => setShowIntro(false);
  const handleShowIntro = () => setShowIntro(true);

  //滚动到顶部
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const showBiliPlayer = (song) => {
    setBVID(song.BVID);
    setPlayerModalShow(true);
    setPlayerModalSongName(song.song_name);
  }

  const focusSearchInput = () => {
    searchInputRef.current?.focus();
  };

  const addSearchTag = (tag) => {
    if (!tag) {
      return;
    }
    const trimmedTag = tag.trim();
    if (!trimmedTag) {
      return;
    }
    const langCategories = (config.LanguageCategories || []).map((s) =>
      s.toLowerCase()
    );
    const isLanguage = langCategories.includes(trimmedTag.toLowerCase());
    const exists = searchTags.some(
      (existingTag) => existingTag.toLowerCase() === trimmedTag.toLowerCase()
    );
    if (!exists) {
      setSearchTags((prev) => {
        const withoutOtherLangs = isLanguage
          ? prev.filter((t) => !langCategories.includes(t.toLowerCase()))
          : prev;
        return [...withoutOtherLangs, trimmedTag];
      });
    }
    setSearchInputValue("");
    focusSearchInput();
  };

  const removeSearchTag = (tagToRemove) => {
    setSearchTags((prev) =>
      prev.filter((tag) => tag.toLowerCase() !== tagToRemove.toLowerCase())
    );
    focusSearchInput();
  };

  // 重复点击同一标签 -> 切换为删除效果（存在则移除，不存在则添加）
  const addOrRemoveSearchTag = (tag) => {
    if (!tag) return;
    const trimmedTag = tag.toString().trim();
    if (!trimmedTag) return;

    const langCategories = (config.LanguageCategories || []).map((s) =>
      s.toLowerCase()
    );
    const exists = searchTags.some(
      (existingTag) => existingTag.toLowerCase() === trimmedTag.toLowerCase()
    );
    const isLanguage = langCategories.includes(trimmedTag.toLowerCase());
    if (exists) {
      removeSearchTag(trimmedTag);
    } else {
      if (isLanguage) {
        // 语言标签互斥：添加新语言前，移除已有的语言标签
        setSearchTags((prev) => [
          ...prev.filter((t) => !langCategories.includes(t.toLowerCase())),
          trimmedTag,
        ]);
        setSearchInputValue("");
        focusSearchInput();
      } else {
        addSearchTag(trimmedTag);
      }
    }
  };

  const handleSearchInputChange = (value) => {
    setSearchInputValue(value);
  };

  const handleSearchInputKeyDown = (event) => {
    const trimmedValue = searchInputValue.trim();
    if (event.key === 'Enter' || event.key === ',' || event.key === 'Tab') {
      if (trimmedValue) {
        event.preventDefault();
        addSearchTag(trimmedValue);
      } else if (event.key === 'Enter') {
        event.preventDefault();
      }
    } else if (event.key === 'Backspace' && searchInputValue === "" && searchTags.length) {
      event.preventDefault();
      removeSearchTag(searchTags[searchTags.length - 1]);
    }
  };

  // 清除所有过滤项（顶部“全部”）
  const clearAllFilters = () => {
    setSearchTags([]);
    setCategorySelection({ lang: "", initial: "", paid: false, remark: "" });
    setSearchInputValue("");
    focusSearchInput();
  };

  return (
    <div className={styles.outerContainer}>
      <Link href={"https://live.bilibili.com/" + config.BiliLiveRoomID} passHref>
        <a target="_blank" style={{ textDecoration: "none", color: "#1D0C26" }}>
          <div className={styles.goToLiveDiv}>
            <div className={styles.cornerToggle}>
              <Image
                loader={imageLoader}
                src="assets/icon/bilibili_logo_padded.png"
                alt="去直播间"
                width={50}
                height={50}
              />
              <b>
                <i>去直播间</i>
              </b>
            </div>
          </div>
        </a>
      </Link>
      <div className={styles.offCanvasToggleDiv} onClick={handleShowIntro}>
        <div className={styles.cornerToggle}>
          <Image
            loader={imageLoader}
            src="assets/images/self_intro.webp"
            alt="打开自我介绍"
            width={50}
            height={50}
          />
          <b>
            <i>自我介绍</i>
          </b>
        </div>
      </div>
      <Container>
        <Head>
          <title>{config.Name}的歌单</title>
          <meta name="keywords" content="B站,bilibili,哔哩哔哩,虚拟主播,歌单" />
          <meta name="description" content={`${config.Name}的歌单`} />
          <link rel="icon" type="image/x-icon" href="/favicon.png"></link>
        </Head>

        <section className={styles.main}>
          {/** 头像和标题 */}
          <Row>
            <Banner
              songCount={filteredSongList.length}
            />
          </Row>
          {/** 过滤器控件 */}
          <Row>
            <SongListFilter
              categorySelection={categorySelection}
              setLanguageState={setLanguageState}
              setRemarkState={setRemarkState}
              setPaidState={setPaidState}
              setInitialState={setInitialState}
              searchTags={searchTags}
              onLanguageTagToggle={(label) => {
                if (label === '全部') {
                  clearAllFilters();
                } else {
                  addOrRemoveSearchTag(label);
                }
              }}
            />
          </Row>
          <Row>
            <Col xs={12} md={9}>
              <div
                className={`${styles.filters} ${styles.searchTagInput}`}
                onClick={focusSearchInput}
              >
                {searchTags.map((tag) => (
                  <span key={tag} className={styles.searchTagPill}>
                    <span>{tag}</span>
                    <button
                      type="button"
                      className={styles.searchTagRemove}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSearchTag(tag);
                      }}
                      aria-label={`移除 ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  ref={searchInputRef}
                  value={searchInputValue}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onKeyDown={handleSearchInputKeyDown}
                  className={styles.searchTagInputField}
                  placeholder={searchTags.length ? "" : "搜索"}
                  aria-label="搜索"
                />
              </div>
            </Col>
            <Col xs={12} md={3}>
              <div className="d-grid">
                <Button
                  title="从下面的歌单里随机挑一首"
                  className={styles.customRandomButton}
                  onClick={handleRandomSong}
                >
                  随便听听
                </Button>
              </div>
            </Col>
          </Row>
          {/** 歌单表格 */}
          <Row>
            <Col>
              <div className={styles.songListMarco}>
                <Container fluid>
                  <Table responsive>
                  <thead>
  <tr>
    <th className={styles.sortableHeader}></th>
    <th onClick={() => handleSort('song_name')} className={styles.sortableHeader}>
      歌名 {sortKey === 'song_name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
    </th>
    <th className={styles.sortableHeader}></th>
    <th onClick={() => handleSort('artist')} className={styles.sortableHeader}>
      歌手 {sortKey === 'artist' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
    </th>
    <th onClick={() => handleSort('language')} className={styles.sortableHeader}>
      语言 {sortKey === 'language' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
    </th>
    <th onClick={() => handleSort('remarks')} className={styles.sortableHeader}>
      备注 {sortKey === 'remarks' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
    </th>
  </tr>
</thead>
                    <tbody className="songList">
                    <SongDetail
                      filteredSongList={sortedList}
                      handleClickToCopy={handleClickToCopy}
                      showBiliPlayer={showBiliPlayer}
                      onTagAdd={addOrRemoveSearchTag}
                      searchTags={searchTags}
                    />
                    </tbody>
                  </Table>
                </Container>
              </div>
            </Col>
          </Row>
        </section>
        {showToTopButton ? (
          <button
            onClick={scrollToTop}
            className={styles.backToTopBtn}
            title="返回顶部"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-chevron-up"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"
              />
            </svg>
          </button>
        ) : (
          <div></div>
        )}
        <footer className={styles.footer}>
          {config.Footer}
        </footer>
      </Container>

      <Offcanvas show={showIntro} onHide={handleCloseIntro}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{config.Name}的自我介绍</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <BannerMobile />
        </Offcanvas.Body>
      </Offcanvas>

      <BiliPlayerModal
        show={modalPlayerShow}
        onHide={() => setPlayerModalShow(false)}
        bvid={BVID}
        modalPlayerSongName={modalPlayerSongName}
      />
    </div>
  );
}
