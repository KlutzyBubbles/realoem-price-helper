import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"

import type {
  PartInfo,
  PartNumber,
  PartSearchRequest,
  PartSearchResponse
} from "~common/types"

type PartRow = {
  partNumber: PartNumber
  infoCell: HTMLTableCellElement
}

export const config: PlasmoCSConfig = {
  matches: ["https://www.realoem.com/bmw/enUS/showparts*"]
}

function getTableBody() {
  return document.querySelector("#partsList > tbody")
}

function getTableRows() {
  return document.querySelectorAll("#partsList > tbody > tr:not(:first-child)")
}

function extendTableHeader() {
  const headerRow = getTableBody().firstChild
  if (headerRow) {
    const headerNode = document.createElement("th")
    const textNode = document.createTextNode("Shop")
    headerNode.appendChild(textNode)
    headerNode.className = "c0"
    headerRow.appendChild(headerNode)
  }
}

function getPartNumber(tableRow: Element): PartNumber | undefined {
  const partAnchor = tableRow.querySelector(
    ':scope > td > a[href^="/bmw/enUS/part?"]'
  )
  if (partAnchor) {
    return partAnchor.textContent
  }
}

function extendTableRows(): PartRow[] {
  let partRows: PartRow[] = []
  getTableRows().forEach((tableRow) => {
    const cellNode = document.createElement("td")
    tableRow.appendChild(cellNode)

    const partNumber = getPartNumber(tableRow)
    if (partNumber) {
      partRows.push({
        partNumber,
        infoCell: cellNode
      })
    }
  })
  return partRows
}

async function getPartInfo(partNumber: PartNumber): Promise<PartInfo> {
  const request: PartSearchRequest = {
    partNumber
  }
  const response: PartSearchResponse = await sendToBackground({
    name: "search-cars245",
    body: request
  })
  if (response) {
    if (response.success === true) {
      return response.result
    } else if (response.success === false) {
      throw Error(`Error fetching part info: ${response.error}`)
    }
  } else {
    throw Error("Error fetching part info")
  }
}

function createLinkNode(partInfo: PartInfo): HTMLAnchorElement {
  const node = document.createElement("a")
  node.href = partInfo.url.toString()
  node.textContent = `$${partInfo.price}`
  return node
}

async function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

extendTableHeader()
let partRows = extendTableRows()
partRows.forEach(async (partRow, i) => {
  const textNode = document.createTextNode("Loading...")
  partRow.infoCell.appendChild(textNode)

  try {
    const partInfo = await getPartInfo(partRow.partNumber)
    partRow.infoCell.appendChild(createLinkNode(partInfo))
    textNode.remove()
  } catch (err) {
    textNode.textContent = "not found"
  }
})