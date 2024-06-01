import { useEffect, useState, type FC } from "react"

import { QualityFilter } from "~common/quality_filter"
import { type PartNumber, type PartsListing } from "~common/types"
import CompactPartsDisplay from "~components/compact_parts_display"
import LoadError from "~components/load_error"
import PartFilterControl from "~components/part_filter_control"
import { getParts, type ErrorMsg } from "~frontend/get_parts"
import {
  filterAndSortParts,
  qualityFiltersUnavailable
} from "~frontend/listings_filter"

const ShopInline: FC<{
  partNumber: PartNumber
  initialQualityFilter: QualityFilter
}> = (props) => {
  const [partsListing, setPartsListing] = useState(null as PartsListing | null)
  const [errorMsg, setErrorMsg] = useState(null as ErrorMsg | null)
  const [selectedFilter, setSelectedFilter] = useState(
    props.initialQualityFilter
  )
  const [loadingDone, setLoadingDone] = useState(false)

  const unavailableQualities = partsListing
    ? qualityFiltersUnavailable(partsListing)
    : []

  useEffect(() => {
    getParts(props.partNumber, setPartsListing, setErrorMsg, setLoadingDone)
  }, [])

  useEffect(() => {
    if (partsListing !== null) {
      if (partsListing && unavailableQualities.includes(selectedFilter)) {
        setSelectedFilter(QualityFilter.Any)
      } else {
        setSelectedFilter(props.initialQualityFilter)
      }
    }
  }, [partsListing])

  if (errorMsg) {
    return <LoadError error={errorMsg} />
  }

  if (partsListing) {
    const { exactMatches, suggestedMatches } = filterAndSortParts(
      partsListing,
      selectedFilter
    )

    return (
      <div className="flex flex-row space-x-2">
        <div>
          <PartFilterControl
            listing={partsListing}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            large={false}
          />
        </div>
        <span>{!loadingDone ? "loading..." : ""}</span>
        <CompactPartsDisplay parts={exactMatches} />
      </div>
    )
  }
}

export default ShopInline
