// Originally from https://github.com/mirnovov/obsidian-homepage/blob/main/src/ui.ts
import {
	App,
	FuzzySuggestModal,
	Notice,
	TAbstractFile,
	TFile,
	TFolder,
	FuzzyMatch,
} from "obsidian";
import { TextInputSuggest } from "./suggest";
import { trimFile } from "./utils";

export class FileSuggest extends TextInputSuggest<TFile> {
	getSuggestions(inputStr: string): TFile[] {
		const abstractFiles = this.app.vault.getAllLoadedFiles();
		const files: TFile[] = [];
		const inputLower = inputStr.toLowerCase();

		abstractFiles.forEach((file: TAbstractFile) => {
			if (
				file instanceof TFile &&
				"md" == file.extension &&
				file.path.toLowerCase().contains(inputLower)
			) {
				files.push(file);
			}
		});

		return files;
	}

	renderSuggestion(file: TFile, el: HTMLElement) {
		if (file.extension == "md") {
			el.setText(trimFile(file));
		} else {
			//we don't use trimFile here as the extension isn't displayed here
			el.setText(file.path.slice(0, -7));
			el.insertAdjacentHTML(
				"beforeend",
				`<div class="nav-file-tag" style="display:inline-block;vertical-align:middle">canvas</div>`,
			);
		}
	}

	selectSuggestion(file: TFile) {
		this.inputEl.value = trimFile(file);
		this.inputEl.trigger("input");
		this.close();
	}
}

export class FolderSuggest extends TextInputSuggest<TFolder> {
	getSuggestions(inputStr: string): TFolder[] {
		const abstractFiles = this.app.vault.getAllLoadedFiles();
		const folders: TFolder[] = [];
		const inputLower = inputStr.toLowerCase();

		abstractFiles.forEach((file: TAbstractFile) => {
			if (
				file instanceof TFolder &&
				file.path.toLowerCase().contains(inputLower)
			) {
				folders.push(file);
			}
		});

		return folders;
	}

	renderSuggestion(folder: TFolder, el: HTMLElement) {
		// @ts-ignore
		el.setText(trimFile(folder));
	}

	selectSuggestion(folder: TFolder) {
		// @ts-ignore
		this.inputEl.value = trimFile(folder);
		this.inputEl.trigger("input");
		this.close();
	}
}

export class FileSelectionModal extends FuzzySuggestModal<TFile> {
	constructor(
		app: App,
		templatesFolder: string,
		onSelect: (file: TFile) => void,
	) {
		super(app);
		this.templatesFolder = templatesFolder;
		this.onSelect = onSelect;
	}

	// Get all files from the vault to populate the list
	getItems(): TFile[] {
		const folderPath = this.templatesFolder;
		const abstractFolder = this.app.vault.getAbstractFileByPath(folderPath);

		if (abstractFolder instanceof TFolder) {
			// Get only the files (ignoring sub-folders)
			const filesInFolder = abstractFolder.children.filter(
				(file) => file instanceof TFile,
			) as TFile[];

			return filesInFolder;
		} else {
			console.error("Templates Folder not found or path is a file.");
		}
		return [];
	}

	// Define what text to display for each file in the list
	getItemText(file: TFile): string {
		return file.path;
	}

	// Logic to execute when the user selects a file
	onChooseItem(file: TFile, evt: MouseEvent | KeyboardEvent): void {
		this.onSelect(file);
	}
}
