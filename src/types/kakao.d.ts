declare global {
  interface Window {
    kakao: {
      maps: typeof kakao.maps;
    };
  }
}

declare namespace kakao.maps {
  function load(callback: () => void): void;

  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  class LatLngBounds {
    constructor(sw?: LatLng, ne?: LatLng);
    extend(latlng: LatLng): void;
    getSouthWest(): LatLng;
    getNorthEast(): LatLng;
  }

  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    getCenter(): LatLng;
    relayout(): void;
    setBounds(bounds: LatLngBounds): void;
  }

  interface MapOptions {
    center: LatLng;
    level: number;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
  }

  interface MarkerOptions {
    position: LatLng;
    image?: MarkerImage;
    title?: string;
  }

  class MarkerImage {
    constructor(src: string, size: Size, options?: MarkerImageOptions);
  }

  interface MarkerImageOptions {
    offset?: Point;
    spriteOrigin?: Point;
    spriteSize?: Size;
  }

  class Size {
    constructor(width: number, height: number);
  }

  class Point {
    constructor(x: number, y: number);
  }

  class Polyline {
    constructor(options: PolylineOptions);
    setMap(map: Map | null): void;
  }

  interface PolylineOptions {
    path: LatLng[] | LatLng[][];
    strokeWeight?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeStyle?: string;
    endArrow?: boolean;
  }

  interface KakaoMouseEvent {
    latLng: LatLng;
    point: Point;
  }

  namespace event {
    // 1. Map 클릭 이벤트
    function addListener(
      target: Map,
      type: 'click',
      callback: (e: KakaoMouseEvent) => void,
    ): void;

    // 2. Marker 클릭 이벤트
    function addListener(
      target: Marker,
      type: 'click',
      callback: (e: MouseEvent) => void,
    ): void;

    // 3. 그 외 모든 경우
    function addListener(
      target: Map | Marker | Polyline,
      type: string,
      callback: (...args: unknown[]) => void,
    ): void;
  }

  namespace services {
    enum Status {
      OK = 'OK',
      ZERO_RESULT = 'ZERO_RESULT',
      ERROR = 'ERROR',
    }

    class Places {
      constructor();
      keywordSearch(
        keyword: string,
        callback: (
          data: PlaceResult[],
          status: Status,
          pagination: Pagination,
        ) => void,
        options?: KeywordSearchOptions,
      ): void;
    }

    interface KeywordSearchOptions {
      category_group_code?: string;
      location?: LatLng;
      radius?: number;
      bounds?: LatLngBounds;
      size?: number;
      page?: number;
      sort?: string;
      rect?: string;
    }

    interface PlaceResult {
      id: string;
      place_name: string;
      category_name: string;
      category_group_code: string;
      category_group_name: string;
      phone: string;
      address_name: string;
      road_address_name: string;
      x: string;
      y: string;
      place_url: string;
      distance: string;
    }

    interface Pagination {
      total_count: number;
      pageable_count: number;
      is_end: boolean;
      same_name: {
        region: string;
        keyword: string;
        selected_region: string;
      };
      gotoFirst(): void;
      gotoLast(): void;
      gotoPage(page: number): void;
      nextPage(): void;
      prevPage(): void;
    }
  }
}
