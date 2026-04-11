import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SERVICE_ROOT_PATH = "/gallery/service";
const LOGIN_URL = `${GALLERY_API_BASE_URL}/gallery/login`;
const LOGOUT_URL = `${GALLERY_API_BASE_URL}/gallery/logout`;
const USER_URL = `${GALLERY_API_BASE_URL}/gallery/user`;
const ADMIN_LOCATIONS_URL = `${GALLERY_API_BASE_URL}/gallery/admin/db/locations`;

type DirectoryDto = {
  name: string;
  path: string;
  parentPath?: string;
  image?: MediaDto;
};

type ImageFormatDto = {
  code: string;
  width: number;
  height: number;
};

type MediaDto = {
  formatPath: string;
  contentType: string;
  filename: string;
  dateTaken: string;
  parentPath?: string;
  videoPath?: string;
};

type ServiceResponse = {
  directories: DirectoryDto[];
  media: MediaDto[];
  videoFormats: string[];
  allowCustomImageSizes: boolean;
  imageFormats: ImageFormatDto[];
};

type UserResponse = {
  username: string;
  roles: string[];
};

type DirectoryNode = {
  kind: "directory";
  name: string;
  path: string;
  parentPath?: string;
  thumbUrl?: string;
};

type MediaKind = "image" | "video";

type MediaNode = {
  kind: MediaKind;
  name: string;
  thumbUrl: string;
  formatPath: string;
  contentType: string;
  dateTaken: string;
  parentPath?: string;
  videoPath?: string;
};

type GalleryNode = DirectoryNode | MediaNode;

type View = "checking" | "login" | "gallery";

type SortOrder = "DESC" | "ASC";

type ContextMenuState =
  | null
  | {
      x: number;
      y: number;
      goToDirectoryPath?: string;
      downloadUrl?: string;
      filename?: string;
      label?: string;
    };

const isDirectory = (node: GalleryNode): node is DirectoryNode => node.kind === "directory";

const isMedia = (node: GalleryNode): node is MediaNode =>
  node.kind === "image" || node.kind === "video";

const chooseBestImageFormatCode = (formats: ImageFormatDto[]): string | undefined => {
  if (!formats.length) return undefined;

  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1920;
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const targetWidth = viewportWidth * dpr;

  const sorted = [...formats].sort((a, b) => a.width - b.width);
  const match = sorted.find((f) => f.width >= targetWidth);
  return (match ?? sorted[sorted.length - 1]).code;
};

type ThumbnailCardProps = {
  node: GalleryNode;
  mediaIndex?: number;
  onOpenDirectory: (dir: DirectoryNode) => void;
  onOpenMedia: (mediaIndex: number) => void;
  onOpenNodeContextMenu: (event: React.MouseEvent | React.TouchEvent, node: GalleryNode) => void;
};

const ThumbnailCard: React.FC<ThumbnailCardProps> = ({
  node,
  mediaIndex,
  onOpenDirectory,
  onOpenMedia,
  onOpenNodeContextMenu
}) => {
  if (isDirectory(node)) {
    const hasDirectoryThumb = typeof node.thumbUrl === "string" && node.thumbUrl.length > 0;
    return (
      <button
        className={hasDirectoryThumb ? "thumb-card" : "thumb-card directory"}
        onClick={() => onOpenDirectory(node)}
        onContextMenu={(e) => onOpenNodeContextMenu(e, node)}>
        {hasDirectoryThumb ? (
          <div className="thumb-media">
            <img src={node.thumbUrl} alt={node.name} loading="lazy" className="thumb-image" />
          </div>
        ) : (
          <div className="thumb-icon folder-icon" />
        )}
        <div className="thumb-meta">
          <div className="thumb-title">{node.name}</div>
          {hasDirectoryThumb && <div className="thumb-subtitle">Folder</div>}
        </div>
      </button>
    );
  }

  const isVideo = node.kind === "video";
  const handleOpen = () => {
    if (typeof mediaIndex === "number") {
      onOpenMedia(mediaIndex);
    }
  };

  const longPressTimerRef = useRef<number | null>(null);
  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchStart: React.TouchEventHandler = (e) => {
    clearLongPress();
    longPressTimerRef.current = window.setTimeout(() => {
      onOpenNodeContextMenu(e, node);
    }, 600);
  };

  const handleTouchEnd: React.TouchEventHandler = () => {
    clearLongPress();
  };

  const handleTouchMove: React.TouchEventHandler = () => {
    clearLongPress();
  };

  return (
    <button
      className="thumb-card"
      onClick={handleOpen}
      onContextMenu={(e) => onOpenNodeContextMenu(e, node)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <div className="thumb-media">
        <img src={node.thumbUrl} alt={node.name} loading="lazy" className="thumb-image" />
        {isVideo && (
          <div className="thumb-video-overlay">
            <span className="play-icon">▶</span>
          </div>
        )}
      </div>
      <div className="thumb-meta">
        <div className="thumb-title">{node.name}</div>
        <div className="thumb-subtitle">{isVideo ? "Video" : "Image"}</div>
      </div>
    </button>
  );
};

type CarouselProps = {
  items: MediaNode[];
  currentIndex: number;
  imageFormats: ImageFormatDto[];
  videoFormats: string[];
  selectedVideoFormat: string | null;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
  onOpenMediaContextMenu: (event: React.MouseEvent | React.TouchEvent, media: MediaNode) => void;
};

const CarouselModal: React.FC<CarouselProps> = ({
  items,
  currentIndex,
  imageFormats,
  videoFormats,
  selectedVideoFormat,
  onClose,
  onChangeIndex,
  onOpenMediaContextMenu
}) => {
  // Prevent background scrolling while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const longPressTimerRef = useRef<number | null>(null);
  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchStart: React.TouchEventHandler = (e) => {
    clearLongPress();
    longPressTimerRef.current = window.setTimeout(() => {
      onOpenMediaContextMenu(e, current);
    }, 600);
  };

  const handleTouchEnd: React.TouchEventHandler = () => {
    clearLongPress();
  };

  const handleTouchMove: React.TouchEventHandler = () => {
    clearLongPress();
  };

  const preloadedImageUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const bestCode = chooseBestImageFormatCode(imageFormats) ?? "fullhd";

    const preloadImageAtIndex = (index: number) => {
      const item = items[index];
      if (!item) return;
      if (!item.contentType.startsWith("image/")) return;

      const url = `${GALLERY_API_BASE_URL}${item.formatPath.replace("{imageFormat}", bestCode)}`;
      if (preloadedImageUrlsRef.current.has(url)) return;

      const img = new Image();
      img.src = url;
      preloadedImageUrlsRef.current.add(url);
    };

    // Preload both directions so clicking left or right is instant
    preloadImageAtIndex(currentIndex - 1);
    preloadImageAtIndex(currentIndex + 1);
  }, [currentIndex, imageFormats, items]);

  const current = items[currentIndex];
  if (!current) return null;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  const goPrev = () => {
    if (hasPrev) onChangeIndex(currentIndex - 1);
  };
  const goNext = () => {
    if (hasNext) onChangeIndex(currentIndex + 1);
  };

  const isImage = current.contentType.startsWith("image/");
  const isVideo = current.contentType.startsWith("video/");

  let mediaUrl = "";
  if (isImage) {
    const bestCode = chooseBestImageFormatCode(imageFormats) ?? "fullhd";
    mediaUrl = `${GALLERY_API_BASE_URL}${current.formatPath.replace("{imageFormat}", bestCode)}`;
  } else {
    // For videos, use videoPath with COMPACT format
    if (current.videoPath) {
      const resolved =
        selectedVideoFormat && videoFormats.includes(selectedVideoFormat)
          ? selectedVideoFormat
          : videoFormats.includes("COMPACT")
            ? "COMPACT"
            : videoFormats[0] || "COMPACT";
      mediaUrl = `${GALLERY_API_BASE_URL}${current.videoPath.replace("{conversionFormat}", resolved)}`;
    } else {
      // Fallback to formatPath if videoPath is not available
      mediaUrl = `${GALLERY_API_BASE_URL}${current.formatPath}`;
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-body" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal-main">
          <button className="nav-button left" onClick={goPrev} disabled={!hasPrev}>
            ‹
          </button>
          <div className="modal-media-container">
            {isImage ? (
              <img
                src={mediaUrl}
                alt={current.name}
                className="modal-image"
                onContextMenu={(e) => onOpenMediaContextMenu(e, current)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
              />
            ) : isVideo ? (
              <video
                src={mediaUrl}
                controls
                autoPlay
                className="modal-video"
                onContextMenu={(e) => onOpenMediaContextMenu(e, current)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
              />
            ) : (
              <img
                src={mediaUrl}
                alt={current.name}
                className="modal-image"
                onContextMenu={(e) => onOpenMediaContextMenu(e, current)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
              />
            )}
          </div>
          <button className="nav-button right" onClick={goNext} disabled={!hasNext}>
            ›
          </button>
        </div>
        <div className="modal-caption">
          <div className="modal-title">{current.name}</div>
          <div className="modal-subtitle">
            {isVideo ? "Video" : "Image"} · {currentIndex + 1} / {items.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [view, setView] = useState<View>("checking");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);

  const [locationsFileUri, setLocationsFileUri] = useState("");
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [locationsStatus, setLocationsStatus] = useState<string | null>(null);

  const [directories, setDirectories] = useState<DirectoryNode[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaNode[]>([]);
  const [imageFormats, setImageFormats] = useState<ImageFormatDto[]>([]);
  const [videoFormats, setVideoFormats] = useState<string[]>([]);
  const [selectedVideoFormat, setSelectedVideoFormat] = useState<string | null>(null);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
  const [directoryError, setDirectoryError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("DESC");
  const [isDirectoriesExpanded, setIsDirectoriesExpanded] = useState(false);
  const directoriesGridRef = useRef<HTMLDivElement | null>(null);
  const [directoriesColumns, setDirectoriesColumns] = useState(0);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  
  // Sync search state with URL query parameter `searchTerm`
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const term = params.get("searchTerm") ?? "";
    setSearch(term);

    const rawSort = params.get("sortOrder");
    setSortOrder(rawSort === "ASC" ? "ASC" : "DESC");
  }, [location.search]);

  const committedSearchTerm = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("searchTerm") ?? "";
  }, [location.search]);

  const committedSortOrder = useMemo<SortOrder>(() => {
    const params = new URLSearchParams(location.search);
    return params.get("sortOrder") === "ASC" ? "ASC" : "DESC";
  }, [location.search]);
  
  const isConfigPage = location.pathname === "/configuration";
  const isAdmin = (currentUser?.roles ?? []).includes("ROLE_ADMIN");

  const effectivePath = location.pathname === "/" ? SERVICE_ROOT_PATH : location.pathname;

  const carouselIndex = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get("carousel");
    if (!raw) return null;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return null;
    if (parsed < 0 || parsed >= mediaItems.length) return null;
    return parsed;
  }, [location.search, mediaItems.length]);

  const setCarouselParam = (index: number | null, replace: boolean) => {
    const params = new URLSearchParams(location.search);
    if (index === null) {
      params.delete("carousel");
    } else {
      params.set("carousel", String(index));
    }
    navigate({ pathname: location.pathname, search: params.toString() }, { replace });
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleBrandClick = () => {
    setIsMenuOpen(false);
    const params = new URLSearchParams(location.search);
    params.delete("carousel");
    params.delete("searchTerm");
    navigate({ pathname: SERVICE_ROOT_PATH, search: params.toString() });
  };

  const redirectToLogin = (message?: string) => {
    setIsMenuOpen(false);
    setAuthError(message ?? "Please log in to access your gallery.");
    setView("login");
    setCurrentUser(null);
    setDirectories([]);
    setMediaItems([]);
    setVideoFormats([]);
    setSelectedVideoFormat(null);
    navigate("/", { replace: true });
  };

  const loadCurrentUser = async () => {
    const response = await fetchWithAuth(USER_URL, undefined);
    if (response.status === 401) {
      return null;
    }
    if (!response.ok) {
      return null;
    }

    const data: UserResponse = await response.json();
    if (!data || typeof data.username !== "string" || !Array.isArray(data.roles)) {
      return null;
    }
    setCurrentUser(data);
    return data;
  };

  const handleLoadLocations = async () => {
    try {
      setLocationsStatus(null);
      setIsLoadingLocations(true);

      const trimmed = locationsFileUri.trim();
      const url =
        trimmed.length > 0
          ? `${ADMIN_LOCATIONS_URL}?fileUri=${encodeURIComponent(trimmed)}`
          : ADMIN_LOCATIONS_URL;

      const response = await fetchWithAuth(url, {
        method: "POST"
      });

      if (response.status === 401) {
        return;
      }

      if (!response.ok) {
        setLocationsStatus("Failed to load locations.");
        return;
      }

      setLocationsStatus("Locations loaded.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setLocationsStatus(`Network error while loading locations: ${message}`);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const fetchWithAuth = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await fetch(input, {
      ...init,
      credentials: "include"
    });

    if (response.status === 401) {
      redirectToLogin("Please log in to access your gallery.");
    }

    return response;
  };

  useEffect(() => {
    if (!contextMenu) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeContextMenu();
    };

    const onPointerDown = () => closeContextMenu();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [contextMenu]);

  const getLargestImageFormatCode = (formats: ImageFormatDto[]): string => {
    if (!formats.length) return "fullhd";
    const largest = [...formats].sort((a, b) => b.width - a.width)[0];
    return largest?.code ?? "fullhd";
  };

  const resolveDownloadUrlForMedia = (media: MediaNode) => {
    const filename = media.name;
    if (media.contentType.startsWith("image/")) {
      const code = getLargestImageFormatCode(imageFormats);
      const url = `${GALLERY_API_BASE_URL}${media.formatPath.replace("{imageFormat}", code)}`;
      return { url, filename, label: "Download image" };
    }

    const resolvedVideoFormat =
      selectedVideoFormat && videoFormats.includes(selectedVideoFormat)
        ? selectedVideoFormat
        : videoFormats.includes("COMPACT")
          ? "COMPACT"
          : videoFormats[0] || "COMPACT";

    const url = media.videoPath
      ? `${GALLERY_API_BASE_URL}${media.videoPath.replace("{conversionFormat}", resolvedVideoFormat)}`
      : `${GALLERY_API_BASE_URL}${media.formatPath}`;
    return { url, filename, label: "Download video" };
  };

  const triggerDownload = async (downloadUrl: string, filename: string) => {
    const response = await fetchWithAuth(downloadUrl, undefined);
    if (response.status === 401) {
      return;
    }
    if (!response.ok) {
      throw new Error(`Download failed (${response.status})`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  };

  const openNodeContextMenu = (
    event: React.MouseEvent | React.TouchEvent,
    node: GalleryNode
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const goToDirectoryPath =
      isDirectory(node) ? node.parentPath : isMedia(node) ? node.parentPath : undefined;

    const resolved = isMedia(node) ? resolveDownloadUrlForMedia(node) : null;

    if ("touches" in event && event.touches.length > 0) {
      const touch = event.touches[0];
      setContextMenu({
        x: touch.clientX,
        y: touch.clientY,
        goToDirectoryPath,
        downloadUrl: resolved?.url,
        filename: resolved?.filename,
        label: resolved?.label
      });
      return;
    }

    const mouseEvent = event as React.MouseEvent;
    setContextMenu({
      x: mouseEvent.clientX,
      y: mouseEvent.clientY,
      goToDirectoryPath,
      downloadUrl: resolved?.url,
      filename: resolved?.filename,
      label: resolved?.label
    });
  };

  const applyServiceResponse = (data: ServiceResponse) => {
    const imgFormats = data.imageFormats ?? [];
    setImageFormats(imgFormats);

    const videoFormatsList = data.videoFormats ?? [];
    setVideoFormats((prev) => (prev.length > 0 ? prev : videoFormatsList));
    setSelectedVideoFormat((prev) => {
      if (prev) return prev;
      if (videoFormatsList.includes("COMPACT")) return "COMPACT";
      return videoFormatsList[0] ?? null;
    });

    const thumbCode =
      imgFormats.find((f) => f.code === "thumb")?.code ??
      (imgFormats.length > 0 ? imgFormats[0].code : "thumb");

    const dirs: DirectoryNode[] = (data.directories ?? [])
      .filter((dir) => typeof dir?.name === "string" && typeof dir?.path === "string")
      .map((dir) => ({
        kind: "directory",
        name: dir.name,
        path: dir.path,
        parentPath: typeof dir.parentPath === "string" ? dir.parentPath : undefined,
        thumbUrl:
          typeof dir.image?.formatPath === "string"
            ? `${GALLERY_API_BASE_URL}${dir.image.formatPath.replace("{imageFormat}", thumbCode)}`
            : undefined
      }));

    const media: MediaNode[] = (data.media ?? [])
      .filter(
        (item) =>
          typeof item?.contentType === "string" &&
          typeof item?.formatPath === "string" &&
          typeof item?.filename === "string" &&
          typeof item?.dateTaken === "string"
      )
      .map((item) => {
        const isVideo = item.contentType.startsWith("video/");
        // For both images and videos, use formatPath with thumb code
        // For videos, formatPath links to an image representing the video
        const thumbUrl = `${GALLERY_API_BASE_URL}${item.formatPath.replace("{imageFormat}", thumbCode)}`;

        const kind: MediaKind = isVideo ? "video" : "image";

        return {
          kind,
          name: item.filename,
          thumbUrl,
          formatPath: item.formatPath,
          contentType: item.contentType,
          dateTaken: item.dateTaken,
          parentPath: typeof item.parentPath === "string" ? item.parentPath : undefined,
          videoPath: item.videoPath
        };
      });

    setDirectories(dirs);
    setMediaItems(media);
  };

  const loadDirectory = async (path: string) => {
    if (!path.startsWith(SERVICE_ROOT_PATH)) {
      return;
    }

    try {
      setDirectoryError(null);
      setIsLoadingDirectory(true);
      const params = new URLSearchParams(location.search);
      const searchTerm = params.get("searchTerm")?.trim();
      const order = params.get("sortOrder") === "ASC" ? "ASC" : "DESC";
      const queryParts = [`sortOrder=${encodeURIComponent(order)}`];
      if (searchTerm) {
        queryParts.unshift(`searchTerm=${encodeURIComponent(searchTerm)}`);
      }
      const query = `?${queryParts.join("&")}`;
      const url = `${GALLERY_API_BASE_URL}${path}${query}`;

      const response = await fetchWithAuth(url, undefined);
      if (response.status === 401) {
        return;
      }

      if (!response.ok) {
        setDirectoryError("Failed to load directory. Please try again.");
        return;
      }

      const data: ServiceResponse = await response.json();
      applyServiceResponse(data);
      setView("gallery");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Unknown error";
      setDirectoryError(`Network error while loading directory: ${message}`);
    } finally {
      setIsLoadingDirectory(false);
    }
  };

  useEffect(() => {
    if (!effectivePath.startsWith(SERVICE_ROOT_PATH)) {
      return;
    }
    void loadDirectory(effectivePath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectivePath, committedSearchTerm, committedSortOrder]);

  useEffect(() => {
    setIsDirectoriesExpanded(false);
  }, [effectivePath, committedSearchTerm]);

  useEffect(() => {
    const el = directoriesGridRef.current;
    if (!el) return;

    const computeColumns = () => {
      const style = window.getComputedStyle(el);
      const template = style.gridTemplateColumns;
      if (!template) return;
      const count = template.split(" ").filter(Boolean).length;
      if (count > 0) setDirectoriesColumns(count);
    };

    computeColumns();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", computeColumns);
      return () => window.removeEventListener("resize", computeColumns);
    }

    const observer = new ResizeObserver(() => computeColumns());
    observer.observe(el);
    return () => observer.disconnect();
  }, [directories.length]);

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const body = new URLSearchParams({
        username,
        password
      }).toString();

      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        credentials: "include",
        body
      });

      if (!response.ok) {
        setLoginError("Login failed. Check your username and password and try again.");
        return;
      }

      setAuthError(null);
      setLoginError(null);
      await loadCurrentUser();
      setView("gallery");
      navigate(SERVICE_ROOT_PATH, { replace: true });
      setDirectories([]);
      setMediaItems([]);
      void loadDirectory(SERVICE_ROOT_PATH);
    } catch {
      setLoginError("Network error while trying to log in. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const filteredDirectories = useMemo(() => {
    return directories;
  }, [directories]);

  const filteredMedia = useMemo(() => {
    return mediaItems;
  }, [mediaItems]);

  const openDirectory = (dir: DirectoryNode) => {
    const params = new URLSearchParams(location.search);
    params.delete("carousel");
    params.delete("searchTerm");
    navigate({ pathname: dir.path, search: params.toString() });
  };

  const openMedia = (mediaIndex: number) => {
    if (mediaIndex >= 0 && mediaIndex < mediaItems.length) {
      setCarouselParam(mediaIndex, false);
    }
  };

  const groupedMediaGridItems = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric"
    });

    const getMonthKey = (dateTaken: string) => {
      const d = new Date(dateTaken);
      if (!Number.isFinite(d.getTime())) return null;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    };

    const getMonthLabel = (dateTaken: string) => {
      const d = new Date(dateTaken);
      if (!Number.isFinite(d.getTime())) return null;
      return formatter.format(d);
    };

    const nodes: React.ReactNode[] = [];
    let lastMonthKey: string | null = null;

    for (const media of filteredMedia) {
      const monthKey = getMonthKey(media.dateTaken);
      if (monthKey && monthKey !== lastMonthKey) {
        const label = getMonthLabel(media.dateTaken);
        if (label) {
          nodes.push(
            <div key={`month-${monthKey}`} className="month-header">
              {label}
            </div>
          );
        }
        lastMonthKey = monthKey;
      }

      const mediaIndex = mediaItems.indexOf(media);
      nodes.push(
        <ThumbnailCard
          key={`${media.formatPath}-${media.name}`}
          node={media}
          mediaIndex={mediaIndex}
          onOpenDirectory={openDirectory}
          onOpenMedia={openMedia}
          onOpenNodeContextMenu={openNodeContextMenu}
        />
      );
    }

    return nodes;
  }, [filteredMedia, mediaItems, openDirectory, openMedia, openNodeContextMenu]);

  const breadcrumbs = useMemo(() => {
    const segments: { name: string; path: string }[] = [];
    if (!effectivePath.startsWith(SERVICE_ROOT_PATH)) {
      return segments;
    }

    segments.push({ name: "Home", path: SERVICE_ROOT_PATH });

    const rest = effectivePath.slice(SERVICE_ROOT_PATH.length).replace(/^\/+/, "");
    if (rest) {
      const parts = rest.split("/");
      let accum = SERVICE_ROOT_PATH;
      for (const part of parts) {
        accum += `/${part}`;
        let decoded = part;
        try {
          decoded = decodeURIComponent(part);
        } catch {
          decoded = part;
        }
        segments.push({ name: decoded, path: accum });
      }
    }

    // If a search term is present, reflect it in the breadcrumb as the final (active) crumb
    const trimmed = committedSearchTerm.trim();
    if (trimmed) {
      const pretty = `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
      segments.push({ name: `Search: ${pretty}`, path: effectivePath });
    }

    return segments;
  }, [effectivePath, committedSearchTerm]);

  const handleBreadcrumbClick = (path: string, keepSearchTerm: boolean) => {
    const params = new URLSearchParams(location.search);
    params.delete("carousel");
    if (!keepSearchTerm) {
      params.delete("searchTerm");
    }
    navigate({ pathname: path, search: params.toString() });
  };

  const closeCarousel = () => setCarouselParam(null, true);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setLoginError(null);
      setDirectoryError(null);
      const response = await fetchWithAuth(LOGOUT_URL, {
        method: "POST",
        credentials: "include"
      });

      if (response.status === 401) {
        return;
      }

      if (!response.ok) {
        setDirectoryError("Failed to log out. Please try again.");
        return;
      }

      setIsMenuOpen(false);
      setAuthError("Please log in to access your gallery.");
      setView("login");
      setCurrentUser(null);
      setDirectories([]);
      setMediaItems([]);
      setVideoFormats([]);
      setSelectedVideoFormat(null);
      navigate("/", { replace: true });
    } catch {
      setDirectoryError("Network error while logging out.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const hasNoItems =
    !isLoadingDirectory && filteredDirectories.length === 0 && filteredMedia.length === 0;

  return (
    <div className="app-shell">
      <header className="app-header">
        {view === "gallery" ? (
          <button type="button" className="brand" onClick={handleBrandClick}>
            Jarea Gallery
          </button>
        ) : (
          <div className="brand">Jarea Gallery</div>
        )}
        {view === "gallery" && !isConfigPage && (
          <div className="search-container">
            <input
              type="search"
              placeholder="Search in this folder..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                const value = search.trim();
                const params = new URLSearchParams(location.search);
                params.delete("carousel");
                if (value.length > 0) {
                  params.set("searchTerm", value);
                } else {
                  params.delete("searchTerm");
                }
                params.set("sortOrder", params.get("sortOrder") === "ASC" ? "ASC" : "DESC");
                navigate({ pathname: location.pathname, search: params.toString() });
              }}
            />
            <select
              className="sort-order"
              value={sortOrder}
              onChange={(e) => {
                const value = e.target.value === "ASC" ? "ASC" : "DESC";
                setSortOrder(value);
                const params = new URLSearchParams(location.search);
                params.delete("carousel");
                params.set("sortOrder", value);
                navigate({ pathname: location.pathname, search: params.toString() });
              }}
              aria-label="Sort order"
            >
              <option value="DESC">Date Descending</option>
              <option value="ASC">Date Ascending</option>
            </select>
          </div>
        )}

        {view === "gallery" && (
          <div className="header-menu">
            <button
              type="button"
              className="menu-button"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              aria-label="Menu"
            >
              ☰
            </button>
            {isMenuOpen && (
              <div className="menu-dropdown" role="menu">
                {isAdmin && (
                  <button
                    type="button"
                    className="menu-item"
                    role="menuitem"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/configuration");
                    }}
                  >
                    Configuration
                  </button>
                )}
                {videoFormats.length > 0 && (
                  <label className="menu-field">
                    <div className="menu-label">Video quality</div>
                    <select
                      className="menu-select"
                      value={selectedVideoFormat ?? ""}
                      onChange={(e) => setSelectedVideoFormat(e.target.value)}
                    >
                      {videoFormats.map((fmt) => (
                        <option key={fmt} value={fmt}>
                          {fmt}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <button
                  type="button"
                  className="menu-item"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  role="menuitem"
                >
                  {isLoggingOut ? "Logging out…" : "Log Out"}
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="app-main">
        {authError && view !== "gallery" && <div className="info-banner">{authError}</div>}

        {view === "checking" && (
          <div className="loading-state">Connecting to gallery service…</div>
        )}

        {view === "login" && (
          <div className="auth-wrapper">
            <div className="login-card">
              <h1 className="login-title">Sign in to Gallery</h1>
              {loginError && <div className="error-banner">{loginError}</div>}
              <form className="login-form" onSubmit={handleLoginSubmit}>
                <label className="field">
                  <span className="field-label">Username</span>
                  <input
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </label>
                <label className="field">
                  <span className="field-label">Password</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </label>
                <button className="primary-button" type="submit" disabled={isLoggingIn}>
                  {isLoggingIn ? "Signing in…" : "Sign in"}
                </button>
              </form>
            </div>
          </div>
        )}

        {view === "gallery" && (
          <>
            {directoryError && <div className="error-banner">{directoryError}</div>}

            {isConfigPage ? (
              <section className="gallery-section">
                <div className="section-header">
                  <div className="section-title">Configuration</div>
                </div>

                <div className="gallery-subsection">
                  <div className="section-header">
                    <div className="section-title">Load Locations</div>
                  </div>

                  {locationsStatus && (
                    <div className={locationsStatus === "Locations loaded." ? "info-banner" : "error-banner"}>
                      {locationsStatus}
                    </div>
                  )}

                  <label className="field">
                    <span className="field-label">File URI</span>
                    <input
                      type="text"
                      value={locationsFileUri}
                      onChange={(e) => setLocationsFileUri(e.target.value)}
                      placeholder="Optional"
                    />
                  </label>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleLoadLocations}
                    disabled={isLoadingLocations}
                  >
                    {isLoadingLocations ? "Loading…" : "Load"}
                  </button>
                </div>
              </section>
            ) : (
              <>
                {breadcrumbs.length > 0 && (
                  <nav className="breadcrumbs">
                    {breadcrumbs.map((crumb, idx) => {
                      const isLast = idx === breadcrumbs.length - 1;
                      const isSearchCrumb =
                        isLast &&
                        committedSearchTerm.trim().length > 0 &&
                        crumb.name.startsWith("Search:");
                      return (
                        <button
                          key={crumb.path}
                          className={`crumb ${isLast ? "active" : ""}`}
                          onClick={() => handleBreadcrumbClick(crumb.path, isSearchCrumb)}
                          disabled={isLast}
                        >
                          {crumb.name}
                        </button>
                      );
                    })}
                  </nav>
                )}

                <section className="gallery-section">
                  {isLoadingDirectory && (
                    <div className="loading-state">Loading items…</div>
                  )}
                  {!isLoadingDirectory && hasNoItems && (
                    <div className="empty-state">
                      <div className="empty-title">No items found</div>
                      <div className="empty-subtitle">
                        Try a different search term or navigate to another folder.
                      </div>
                    </div>
                  )}
                  {!isLoadingDirectory && !hasNoItems && (
                    <>
                      {filteredDirectories.length > 0 && (
                        <section className="gallery-subsection">
                          <div className="section-header">
                            <div className="section-title">Directories</div>
                            {filteredDirectories.length > Math.max(directoriesColumns, 1) && (
                              <button
                                type="button"
                                className="section-toggle"
                                onClick={() => setIsDirectoriesExpanded((v) => !v)}
                              >
                                {isDirectoriesExpanded
                                  ? "Show less"
                                  : `Show all (${filteredDirectories.length})`}
                              </button>
                            )}
                          </div>
                          <div className="grid" ref={directoriesGridRef}>
                            {(isDirectoriesExpanded
                              ? filteredDirectories
                              : filteredDirectories.slice(0, Math.max(directoriesColumns, 1))
                            ).map((dir) => (
                              <ThumbnailCard
                                key={dir.path}
                                node={dir}
                                onOpenDirectory={openDirectory}
                                onOpenMedia={openMedia}
                                onOpenNodeContextMenu={openNodeContextMenu}
                              />
                            ))}
                          </div>
                        </section>
                      )}

                      {filteredMedia.length > 0 && (
                        <section className="gallery-subsection">
                          <div className="section-header">
                            <div className="section-title">Media</div>
                          </div>
                          <div className="grid">{groupedMediaGridItems}</div>
                        </section>
                      )}
                    </>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </main>

      {contextMenu && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          role="menu"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {typeof contextMenu.goToDirectoryPath === "string" &&
            contextMenu.goToDirectoryPath.length > 0 && (
              <button
                type="button"
                className="context-menu-item"
                role="menuitem"
                onClick={() => {
                  try {
                    const params = new URLSearchParams(location.search);
                    params.delete("carousel");
                    params.delete("searchTerm");
                    navigate({
                      pathname: contextMenu.goToDirectoryPath!,
                      search: params.toString()
                    });
                  } finally {
                    closeContextMenu();
                  }
                }}
              >
                Go to parent directory
              </button>
            )}

          {typeof contextMenu.downloadUrl === "string" &&
            contextMenu.downloadUrl.length > 0 &&
            typeof contextMenu.filename === "string" &&
            typeof contextMenu.label === "string" && (
              <button
                type="button"
                className="context-menu-item"
                role="menuitem"
                onClick={async () => {
                  try {
                    await triggerDownload(contextMenu.downloadUrl!, contextMenu.filename!);
                  } catch (error) {
                    const message = error instanceof Error ? error.message : "Unknown error";
                    setDirectoryError(message);
                  } finally {
                    closeContextMenu();
                  }
                }}
              >
                {contextMenu.label}
              </button>
            )}
        </div>
      )}

      {typeof carouselIndex === "number" && (
        <CarouselModal
          items={filteredMedia}
          currentIndex={carouselIndex}
          imageFormats={imageFormats}
          videoFormats={videoFormats}
          selectedVideoFormat={selectedVideoFormat}
          onClose={closeCarousel}
          onChangeIndex={(index) => setCarouselParam(index, true)}
          onOpenMediaContextMenu={(event, media) => openNodeContextMenu(event, media)}
        />
      )}
    </div>
  );
};
