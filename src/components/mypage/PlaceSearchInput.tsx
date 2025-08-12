
import React from 'react';
import Input from '~/src/components/common/input';
import Button from '~/src/components/common/button';

interface PlaceResult {
  id: string;
  place_name: string;
  address_name: string;
}

interface PlaceSearchInputProps {
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  handleSearch: () => void;
  searchResults: PlaceResult[];
  handleSelectPlace: (place: PlaceResult) => void;
  isKakaoMapServicesLoaded: boolean;
}

export default function PlaceSearchInput({
  searchKeyword,
  setSearchKeyword,
  handleSearch,
  searchResults,
  handleSelectPlace,
  isKakaoMapServicesLoaded,
}: PlaceSearchInputProps) {
  return (
    <div>
      <div className="flex space-x-2">
        <Input
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="장소 이름 또는 주소를 검색하세요"
        />
        <Button
          type="button"
          onClick={handleSearch}
          className="w-auto px-4"
          disabled={!isKakaoMapServicesLoaded}
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
