import React from 'react';
import Input from '~/src/components/common/Input';
import Button from '~/src/components/common/Button';

interface PlaceSearchInputProps {
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  handleSearch: () => void;
  searchResults: kakao.maps.services.PlaceResult[];
  handleSelectPlace: (place: kakao.maps.services.PlaceResult) => void;
  isKakaoPlacesServiceReady: boolean;
}

export default function PlaceSearchInput({
  searchKeyword,
  setSearchKeyword,
  handleSearch,
  searchResults,
  handleSelectPlace,
  isKakaoPlacesServiceReady,
}: PlaceSearchInputProps) {
  console.log("PlaceSearchInput: isKakaoPlacesServiceReady =", isKakaoPlacesServiceReady);

  return (
    <div>
      <div className="flex items-center space-x-2">
        <div className="flex-grow">
          <Input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="장소 이름 또는 주소를 검색하세요"
          />
        </div>
        <Button
          type="button"
          onClick={handleSearch}
          className="w-auto flex-shrink-0 px-4"
          disabled={!isKakaoPlacesServiceReady}
        >
          검색
        </Button>
      </div>
      {searchResults.length > 0 && (
        <ul className="border rounded-md max-h-40 overflow-y-auto bg-white mt-2">
          {searchResults.map((result) => (
            <li
              key={result.id}
              className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => handleSelectPlace(result)}
            >
              <strong>{result.place_name}</strong> - {result.address_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
